import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationsAPI, Notification } from '../services/api';
import { useAuth } from './AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const { isConnected, sendMessage } = useWebSocket({
    url: 'ws://localhost:5000/ws',
    onMessage: (data) => {
      switch (data.type) {
        case 'NEW_NOTIFICATION':
          setNotifications(prev => [data.notification, ...prev]);
          if (!data.notification.isRead) {
            setUnreadCount(prev => prev + 1);
          }
          break;
        case 'NOTIFICATION_COUNT_UPDATE':
          setUnreadCount(data.unreadCount);
          break;
      }
    }
  });

  const fetchNotifications = async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationsAPI.getNotifications(token, { page: 1, limit: 50 });
      if (response.success) {
        setNotifications(response.data || []);
        setUnreadCount(response.unreadCount || 0);
      } else {
        setError(response.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUnreadCount = async () => {
    if (!token) return;
    
    try {
      const response = await notificationsAPI.getUnreadCount(token);
      if (response.success) {
        setUnreadCount(response.data?.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to refresh unread count:', err);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!token) return;
    
    try {
      const response = await notificationsAPI.markAsRead(token, notificationId);
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true, readAt: new Date().toISOString() }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      const response = await notificationsAPI.markAllAsRead(token);
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ 
            ...notification, 
            isRead: true, 
            readAt: new Date().toISOString() 
          }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!token) return;
    
    try {
      const response = await notificationsAPI.deleteNotification(token, notificationId);
      if (response.success) {
        // Update local state
        setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
        // Check if the deleted notification was unread
        const deletedNotification = notifications.find(n => n._id === notificationId);
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Handle WebSocket authentication and initial fetch
  useEffect(() => {
    if (!user || !token || !isConnected) return;

    // Authenticate WebSocket connection
    sendMessage({
      type: 'USER_AUTH',
      token: token
    });

    // Initial fetch when user is authenticated
    fetchNotifications();
  }, [user, token, isConnected]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
