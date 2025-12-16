# WebSocket Real-time Updates Setup

This document explains the WebSocket implementation for real-time updates in the Disaster Reporting Platform.

## Features

- **Real-time Report Notifications**: New reports are instantly pushed to admin clients
- **Live Status Updates**: Report verification/rejection updates are broadcast to all clients
- **Admin Panel Integration**: Admin panel automatically refreshes when new reports arrive
- **Toast Notifications**: Visual notifications for new reports and status changes
- **Connection Status**: Live indicator showing WebSocket connection status

## Architecture

### Backend WebSocket Server
- **File**: `backend/src/websocket/websocket.ts`
- **Port**: 5001 (same as HTTP server)
- **Path**: `/ws`
- **Authentication**: JWT-based authentication for admin and user clients

### Frontend WebSocket Client
- **Hook**: `src/hooks/useWebSocket.ts`
- **Integration**: Used in `src/components/admin-panel.tsx`
- **Auto-reconnection**: Built-in reconnection logic with exponential backoff

## WebSocket Events

### Client to Server Events

#### Admin Authentication
```json
{
  "type": "ADMIN_AUTH",
  "token": "jwt-token",
  "role": "admin"
}
```

#### User Authentication
```json
{
  "type": "USER_AUTH",
  "token": "jwt-token",
  "role": "user"
}
```

#### Ping
```json
{
  "type": "PING"
}
```

### Server to Client Events

#### New Report Notification (Admin only)
```json
{
  "type": "NEW_REPORT",
  "report": {
    "_id": "report-id",
    "title": "Report Title",
    "description": "Report Description",
    "severity": "HIGH",
    "status": "PENDING",
    "author": "Author Name",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Report Update
```json
{
  "type": "REPORT_UPDATED",
  "report": {
    "_id": "report-id",
    "status": "VERIFIED",
    "verifiedBy": "admin-id",
    "verifiedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Report Deletion
```json
{
  "type": "REPORT_DELETED",
  "reportId": "report-id"
}
```

#### Report Verification
```json
{
  "type": "REPORT_VERIFICATION",
  "reportId": "report-id",
  "status": "VERIFIED",
  "verifiedBy": "Admin Name",
  "verifiedAt": "2024-01-01T00:00:00.000Z"
}
```

## Setup Instructions

### 1. Backend Setup

The WebSocket server is automatically started with the main server. No additional setup required.

### 2. Frontend Setup

The WebSocket client is already integrated into the admin panel. No additional setup required.

### 3. Testing

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Open the admin panel in your browser
4. Create a new report from the main dashboard
5. Watch the admin panel for real-time updates

## Configuration

### WebSocket URL
- **Development**: `ws://localhost:5001/ws`
- **Production**: `ws://your-domain.com/ws`

### Reconnection Settings
- **Reconnect Interval**: 5 seconds
- **Max Reconnect Attempts**: 5
- **Ping Interval**: 30 seconds

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if backend server is running on port 5001
   - Verify CORS settings allow WebSocket connections
   - Check browser console for error messages

2. **No Real-time Updates**
   - Ensure user is logged in with admin role
   - Check WebSocket connection status in admin panel
   - Verify JWT token is valid

3. **Authentication Errors**
   - Ensure JWT token is not expired
   - Check if user has admin role for admin features
   - Verify token format and secret key

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your backend environment variables.

## Security Considerations

- WebSocket connections are authenticated using JWT tokens
- Admin-only events are restricted to authenticated admin clients
- Rate limiting is applied to prevent abuse
- CORS is configured to restrict origins

## Performance Notes

- WebSocket connections are lightweight and efficient
- Automatic cleanup of disconnected clients
- Memory usage scales linearly with connected clients
- No message queuing - clients must be connected to receive updates

## Future Enhancements

- Message queuing for offline clients
- WebSocket clustering for horizontal scaling
- Real-time analytics dashboard
- Push notifications for mobile clients
- WebRTC integration for video reports
