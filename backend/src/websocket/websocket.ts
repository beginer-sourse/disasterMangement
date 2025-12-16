import WebSocket from 'ws';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { IUser, INotification } from '../types';
import { NotificationService } from '../utils/notificationService';

interface AuthenticatedWebSocket extends WebSocket {
  user?: IUser;
  isAdmin?: boolean;
}

interface WebSocketMessage {
  type: string;
  data?: any;
  token?: string;
  role?: string;
}

class WebSocketServer {
  private wss: WebSocket.Server;
  private clients: Map<string, AuthenticatedWebSocket> = new Map();
  private adminClients: Set<AuthenticatedWebSocket> = new Set();

  constructor(server: HttpServer) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('🔌 WebSocket server started on /ws');
  }

  private handleConnection(ws: AuthenticatedWebSocket) {
    console.log('New WebSocket connection established');

    ws.on('message', (message: string) => {
      try {
        const data: WebSocketMessage = JSON.parse(message);
        this.handleMessage(ws, data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'ERROR',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.handleDisconnection(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      message: 'Connected to Jalsaathi WebSocket server'
    }));
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'ADMIN_AUTH':
        this.handleAdminAuth(ws, message);
        break;
      case 'USER_AUTH':
        this.handleUserAuth(ws, message);
        break;
      case 'PING':
        ws.send(JSON.stringify({ type: 'PONG' }));
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleAdminAuth(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    try {
      if (!message.token) {
        ws.send(JSON.stringify({
          type: 'AUTH_ERROR',
          message: 'No token provided'
        }));
        return;
      }

      const decoded = jwt.verify(message.token, process.env.JWT_SECRET || 'disaster-alert-super-secret-jwt-key-2024') as any;
      
      if (decoded.role !== 'admin') {
        ws.send(JSON.stringify({
          type: 'AUTH_ERROR',
          message: 'Admin access required'
        }));
        return;
      }

      ws.user = decoded;
      ws.isAdmin = true;
      
      const clientId = `admin_${decoded._id}`;
      this.clients.set(clientId, ws);
      this.adminClients.add(ws);

      ws.send(JSON.stringify({
        type: 'AUTH_SUCCESS',
        message: 'Admin authentication successful',
        user: {
          id: decoded._id,
          name: decoded.name,
          role: decoded.role
        }
      }));

      console.log(`Admin ${decoded.name} connected to WebSocket`);
    } catch (error) {
      console.error('Admin auth error:', error);
      ws.send(JSON.stringify({
        type: 'AUTH_ERROR',
        message: 'Invalid token'
      }));
    }
  }

  private handleUserAuth(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    try {
      if (!message.token) {
        ws.send(JSON.stringify({
          type: 'AUTH_ERROR',
          message: 'No token provided'
        }));
        return;
      }

      const decoded = jwt.verify(message.token, process.env.JWT_SECRET || 'disaster-alert-super-secret-jwt-key-2024') as any;
      
      ws.user = decoded;
      
      const clientId = `user_${decoded._id}`;
      this.clients.set(clientId, ws);

      ws.send(JSON.stringify({
        type: 'AUTH_SUCCESS',
        message: 'User authentication successful',
        user: {
          id: decoded._id,
          name: decoded.name,
          role: decoded.role
        }
      }));

      console.log(`User ${decoded.name} connected to WebSocket`);
    } catch (error) {
      console.error('User auth error:', error);
      ws.send(JSON.stringify({
        type: 'AUTH_ERROR',
        message: 'Invalid token'
      }));
    }
  }

  private handleDisconnection(ws: AuthenticatedWebSocket) {
    if (ws.isAdmin) {
      this.adminClients.delete(ws);
    }
    
    // Remove from clients map
    for (const [clientId, client] of this.clients.entries()) {
      if (client === ws) {
        this.clients.delete(clientId);
        break;
      }
    }

    console.log('WebSocket client disconnected');
  }

  // Broadcast new report to all admin clients
  public broadcastNewReport(report: any) {
    const message = JSON.stringify({
      type: 'NEW_REPORT',
      report: report
    });

    this.adminClients.forEach(adminWs => {
      if (adminWs.readyState === WebSocket.OPEN) {
        adminWs.send(message);
      }
    });

    console.log(`Broadcasted new report to ${this.adminClients.size} admin clients`);
  }

  // Broadcast report update to all clients
  public broadcastReportUpdate(report: any) {
    const message = JSON.stringify({
      type: 'REPORT_UPDATED',
      report: report
    });

    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });

    console.log(`Broadcasted report update to ${this.clients.size} clients`);
  }

  // Broadcast report deletion to all clients
  public broadcastReportDeletion(reportId: string) {
    const message = JSON.stringify({
      type: 'REPORT_DELETED',
      reportId: reportId
    });

    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });

    console.log(`Broadcasted report deletion to ${this.clients.size} clients`);
  }

  // Broadcast report verification to all clients
  public broadcastReportVerification(reportId: string, status: string, verifiedBy: string) {
    const message = JSON.stringify({
      type: 'REPORT_VERIFICATION',
      reportId: reportId,
      status: status,
      verifiedBy: verifiedBy,
      verifiedAt: new Date().toISOString()
    });

    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });

    console.log(`Broadcasted report verification to ${this.clients.size} clients`);
  }

  // Get connected clients count
  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  // Get admin clients count
  public getAdminClientsCount(): number {
    return this.adminClients.size;
  }

  // Broadcast new notification to specific user
  public broadcastNotification(recipientId: string, notification: INotification) {
    const clientId = `user_${recipientId}`;
    const client = this.clients.get(clientId);
    
    if (client && client.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'NEW_NOTIFICATION',
        notification: notification
      });
      
      client.send(message);
      console.log(`Notification sent to user ${recipientId}`);
    } else {
      console.log(`User ${recipientId} is not connected, notification will be delivered when they reconnect`);
    }
  }

  // Broadcast notification count update to specific user
  public broadcastNotificationCount(recipientId: string, unreadCount: number) {
    const clientId = `user_${recipientId}`;
    const client = this.clients.get(clientId);
    
    if (client && client.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'NOTIFICATION_COUNT_UPDATE',
        unreadCount: unreadCount
      });
      
      client.send(message);
      console.log(`Notification count update sent to user ${recipientId}: ${unreadCount}`);
    }
  }

  // Broadcast analytics update to all admin clients
  public broadcastAnalyticsUpdate() {
    const message = JSON.stringify({
      type: 'ANALYTICS_UPDATE',
      timestamp: new Date().toISOString()
    });

    this.adminClients.forEach(adminWs => {
      if (adminWs.readyState === WebSocket.OPEN) {
        adminWs.send(message);
      }
    });

    // Also broadcast to all connected users for real-time updates
    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });

    console.log(`Broadcasted analytics update to ${this.clients.size} clients`);
  }
}

export default WebSocketServer;
