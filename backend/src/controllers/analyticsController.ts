import { Request, Response } from 'express';
import DisasterReport from '../models/DisasterReport';
import User from '../models/User';
import Comment from '../models/Comment';
import { IAnalytics, ApiResponse } from '../types';

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get reports by severity
    const reportsBySeverity = await DisasterReport.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    const severityData = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0
    };

    reportsBySeverity.forEach(item => {
      severityData[item._id as keyof typeof severityData] = item.count;
    });

    // Get reports by location
    const reportsByLocation = await DisasterReport.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get user activity
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Get reports statistics
    const totalReports = await DisasterReport.countDocuments();
    const verifiedReports = await DisasterReport.countDocuments({ status: 'VERIFIED' });
    const pendingReports = await DisasterReport.countDocuments({ status: 'PENDING' });
    const rejectedReports = await DisasterReport.countDocuments({ status: 'REJECTED' });

    // Get recent activity
    const recentReports = await DisasterReport.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'name')
      .select('title createdAt author authorName');

    const recentComments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'name')
      .populate('report', 'title')
      .select('content createdAt author authorName report');

    const recentActivity = [
      ...recentReports.map(report => ({
        type: 'report' as const,
        description: `New report: ${report.title}`,
        timestamp: report.createdAt,
        user: report.authorName
      })),
      ...recentComments.map(comment => ({
        type: 'comment' as const,
        description: `Comment on: ${(comment.report as any)?.title || 'Unknown Report'}`,
        timestamp: comment.createdAt,
        user: comment.authorName
      }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);

    const analytics: IAnalytics = {
      reportsBySeverity: severityData,
      reportsByLocation: reportsByLocation.map(item => ({
        location: item._id,
        count: item.count
      })),
      userActivity: {
        totalUsers,
        activeUsers,
        newUsersThisWeek
      },
      reportsStats: {
        totalReports,
        verifiedReports,
        pendingReports,
        rejectedReports
      },
      recentActivity
    };

    res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: analytics
    } as ApiResponse);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const getReportsBySeverity = async (req: Request, res: Response): Promise<void> => {
  try {
    const reportsBySeverity = await DisasterReport.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Reports by severity retrieved successfully',
      data: reportsBySeverity
    } as ApiResponse);
  } catch (error) {
    console.error('Get reports by severity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const getReportsByLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const reportsByLocation = await DisasterReport.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.status(200).json({
      success: true,
      message: 'Reports by location retrieved successfully',
      data: reportsByLocation
    } as ApiResponse);
  } catch (error) {
    console.error('Get reports by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const getUserActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      success: true,
      message: 'User activity retrieved successfully',
      data: {
        totalUsers,
        activeUsers,
        newUsersThisWeek
      }
    } as ApiResponse);
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};
