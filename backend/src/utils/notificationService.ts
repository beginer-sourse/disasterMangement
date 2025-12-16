import Notification from '../models/Notification';
import { INotification } from '../types';
import { wsServer } from '../server';

export class NotificationService {
  // Create a notification for report verification
  static async createReportVerificationNotification(
    reportId: string,
    reportAuthorId: string,
    verifiedBy: string,
    status: 'VERIFIED' | 'REJECTED'
  ): Promise<void> {
    try {
      const title = status === 'VERIFIED' ? 'Report Verified!' : 'Report Rejected';
      const message = status === 'VERIFIED' 
        ? 'Your disaster report has been verified by an admin and is now live.'
        : 'Your disaster report has been reviewed and rejected by an admin.';

      const notification = new Notification({
        recipient: reportAuthorId,
        sender: verifiedBy,
        type: status === 'VERIFIED' ? 'REPORT_VERIFIED' : 'REPORT_REJECTED',
        title,
        message,
        relatedReport: reportId,
        metadata: {
          status,
          verifiedBy
        }
      });

      await notification.save();
      console.log(`Notification created for report ${status.toLowerCase()}: ${reportId}`);
      
      // Send real-time notification via WebSocket
      if (wsServer) {
        wsServer.broadcastNotification(reportAuthorId, notification);
      }
    } catch (error) {
      console.error('Error creating report verification notification:', error);
    }
  }

  // Create a notification for report voting (like/dislike)
  static async createReportVoteNotification(
    reportId: string,
    reportAuthorId: string,
    voterId: string,
    voterName: string,
    voteType: 'up' | 'down'
  ): Promise<void> {
    try {
      // Don't notify the author if they voted on their own report
      if (reportAuthorId === voterId) {
        return;
      }

      const title = voteType === 'up' ? 'Someone liked your report!' : 'Someone disliked your report';
      const message = voteType === 'up' 
        ? `${voterName} liked your disaster report.`
        : `${voterName} disliked your disaster report.`;

      const notification = new Notification({
        recipient: reportAuthorId,
        sender: voterId,
        type: voteType === 'up' ? 'REPORT_LIKED' : 'REPORT_DISLIKED',
        title,
        message,
        relatedReport: reportId,
        metadata: {
          voterName,
          voteType
        }
      });

      await notification.save();
      console.log(`Vote notification created for report: ${reportId}`);
      
      // Send real-time notification via WebSocket
      if (wsServer) {
        wsServer.broadcastNotification(reportAuthorId, notification);
      }
    } catch (error) {
      console.error('Error creating report vote notification:', error);
    }
  }

  // Create a notification for new comment
  static async createCommentNotification(
    reportId: string,
    reportAuthorId: string,
    commenterId: string,
    commenterName: string,
    commentId: string
  ): Promise<void> {
    try {
      // Don't notify the author if they commented on their own report
      if (reportAuthorId === commenterId) {
        return;
      }

      const title = 'New comment on your report';
      const message = `${commenterName} commented on your disaster report.`;

      const notification = new Notification({
        recipient: reportAuthorId,
        sender: commenterId,
        type: 'COMMENT_ADDED',
        title,
        message,
        relatedReport: reportId,
        relatedComment: commentId,
        metadata: {
          commenterName
        }
      });

      await notification.save();
      console.log(`Comment notification created for report: ${reportId}`);
      
      // Send real-time notification via WebSocket
      if (wsServer) {
        wsServer.broadcastNotification(reportAuthorId, notification);
      }
    } catch (error) {
      console.error('Error creating comment notification:', error);
    }
  }

  // Get notifications for a user
  static async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    try {
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({ recipient: userId })
        .populate('sender', 'name email avatar')
        .populate('relatedReport', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments({ recipient: userId });
      const unreadCount = await Notification.countDocuments({ 
        recipient: userId, 
        isRead: false 
      });

      return { notifications, total, unreadCount };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { 
          isRead: true,
          readAt: new Date()
        }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { 
          isRead: true,
          readAt: new Date()
        }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}
