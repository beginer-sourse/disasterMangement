import { Request, Response } from 'express';
import { ApiResponse, IUser } from '../types';
import { NotificationService } from '../utils/notificationService';
import { wsServer } from '../server';

export const getNotifications = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const userId = req.user._id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await NotificationService.getUserNotifications(userId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result.notifications,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      },
      unreadCount: result.unreadCount
    } as ApiResponse);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const markNotificationAsRead = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const { notificationId } = req.params;
    const userId = req.user._id.toString();

    await NotificationService.markAsRead(notificationId, userId);

    // Get updated unread count and broadcast it
    const result = await NotificationService.getUserNotifications(userId, 1, 1);
    if (wsServer) {
      wsServer.broadcastNotificationCount(userId, result.unreadCount);
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    } as ApiResponse);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const markAllNotificationsAsRead = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const userId = req.user._id.toString();

    await NotificationService.markAllAsRead(userId);

    // Broadcast updated unread count (should be 0)
    if (wsServer) {
      wsServer.broadcastNotificationCount(userId, 0);
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    } as ApiResponse);
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const deleteNotification = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const { notificationId } = req.params;
    const userId = req.user._id.toString();

    await NotificationService.deleteNotification(notificationId, userId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const getUnreadCount = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
      return;
    }

    const userId = req.user._id.toString();
    const result = await NotificationService.getUserNotifications(userId, 1, 1);

    res.status(200).json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: { unreadCount: result.unreadCount }
    } as ApiResponse);
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};
