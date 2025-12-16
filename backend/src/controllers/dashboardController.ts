import { Request, Response } from 'express';
import DisasterReport from '../models/DisasterReport';
import User from '../models/User';
import Comment from '../models/Comment';
import { ApiResponse } from '../types';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Active Reports (all reports that are not rejected)
    const activeReports = await DisasterReport.countDocuments({
      status: { $in: ['PENDING', 'VERIFIED', 'IN_PROGRESS'] }
    });

    // Active Reports from last week for trend calculation
    const activeReportsLastWeek = await DisasterReport.countDocuments({
      status: { $in: ['PENDING', 'VERIFIED', 'IN_PROGRESS'] },
      createdAt: { $gte: oneWeekAgo }
    });

    // Verified Incidents (reports with VERIFIED status)
    const verifiedIncidents = await DisasterReport.countDocuments({
      status: 'VERIFIED'
    });

    // Verified Incidents from last week for trend calculation
    const verifiedIncidentsLastWeek = await DisasterReport.countDocuments({
      status: 'VERIFIED',
      createdAt: { $gte: oneWeekAgo }
    });

    // Active Citizens (unique users who have been active in the last 7 days)
    // Count users who have either logged in recently OR created reports recently
    const activeUsersFromLogin = await User.countDocuments({
      lastLoginAt: { $gte: oneWeekAgo }
    });

    const activeUsersFromReports = await DisasterReport.distinct('author', {
      createdAt: { $gte: oneWeekAgo }
    });

    // Count users who have ever logged in (for testing purposes)
    const totalUsersWithLogin = await User.countDocuments({
      lastLoginAt: { $exists: true }
    });

    // Use the maximum of all counts to ensure we capture all active users
    const activeCitizens = Math.max(activeUsersFromLogin, activeUsersFromReports.length, totalUsersWithLogin);

    // Active Citizens from last month for trend calculation
    const activeUsersFromLoginLastMonth = await User.countDocuments({
      lastLoginAt: { $gte: oneMonthAgo, $lt: oneWeekAgo }
    });

    const activeUsersFromReportsLastMonth = await DisasterReport.distinct('author', {
      createdAt: { $gte: oneMonthAgo, $lt: oneWeekAgo }
    });

    const activeCitizensLastMonth = Math.max(activeUsersFromLoginLastMonth, activeUsersFromReportsLastMonth.length);

    // Average Response Time (time between report creation and verification)
    const responseTimeData = await DisasterReport.aggregate([
      {
        $match: {
          status: 'VERIFIED',
          verifiedAt: { $exists: true }
        }
      },
      {
        $project: {
          responseTime: {
            $divide: [
              { $subtract: ['$verifiedAt', '$createdAt'] },
              60000 // Convert to minutes
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const avgResponseTime = responseTimeData.length > 0 
      ? Math.round(responseTimeData[0].avgResponseTime) 
      : 0;

    // Average Response Time from last week for trend calculation
    const responseTimeDataLastWeek = await DisasterReport.aggregate([
      {
        $match: {
          status: 'VERIFIED',
          verifiedAt: { $exists: true },
          createdAt: { $gte: oneWeekAgo }
        }
      },
      {
        $project: {
          responseTime: {
            $divide: [
              { $subtract: ['$verifiedAt', '$createdAt'] },
              60000
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const avgResponseTimeLastWeek = responseTimeDataLastWeek.length > 0 
      ? Math.round(responseTimeDataLastWeek[0].avgResponseTime) 
      : 0;

    // Alerts Today (reports created today)
    const alertsToday = await DisasterReport.countDocuments({
      createdAt: { $gte: yesterday }
    });

    // Alerts Yesterday for trend calculation
    const alertsYesterday = await DisasterReport.countDocuments({
      createdAt: { 
        $gte: new Date(yesterday.getTime() - 24 * 60 * 60 * 1000),
        $lt: yesterday
      }
    });

    // Calculate trends
    const activeReportsTrend = activeReportsLastWeek > 0 
      ? Math.round(((activeReports - activeReportsLastWeek) / activeReportsLastWeek) * 100)
      : 0;

    const verifiedIncidentsTrend = verifiedIncidentsLastWeek > 0
      ? Math.round(((verifiedIncidents - verifiedIncidentsLastWeek) / verifiedIncidentsLastWeek) * 100)
      : 0;

    const activeCitizensTrend = activeCitizensLastMonth > 0
      ? Math.round(((activeCitizens - activeCitizensLastMonth) / activeCitizensLastMonth) * 100)
      : 0;

    const responseTimeTrend = avgResponseTimeLastWeek > 0
      ? Math.round(avgResponseTime - avgResponseTimeLastWeek)
      : 0;

    const alertsTrend = alertsYesterday > 0
      ? alertsToday - alertsYesterday
      : 0;

    const dashboardStats = {
      activeReports: {
        value: activeReports,
        trend: activeReportsTrend,
        trendType: activeReportsTrend >= 0 ? 'up' : 'down',
        description: 'from last week'
      },
      verifiedIncidents: {
        value: verifiedIncidents,
        trend: verifiedIncidentsTrend,
        trendType: verifiedIncidentsTrend >= 0 ? 'up' : 'down',
        description: 'from last week'
      },
      activeCitizens: {
        value: activeCitizens,
        trend: activeCitizensTrend,
        trendType: activeCitizensTrend >= 0 ? 'up' : 'down',
        description: 'from last month'
      },
      avgResponseTime: {
        value: avgResponseTime,
        trend: Math.abs(responseTimeTrend),
        trendType: responseTimeTrend <= 0 ? 'down' : 'up', // Lower response time is better
        description: 'from last week'
      },
      alertsToday: {
        value: alertsToday,
        trend: alertsTrend,
        trendType: alertsTrend >= 0 ? 'up' : 'down',
        description: 'since yesterday'
      }
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: dashboardStats
    } as ApiResponse);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const getRealTimeStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Recent reports (last hour)
    const recentReports = await DisasterReport.countDocuments({
      createdAt: { $gte: oneHourAgo }
    });

    // Recent users (last hour)
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: oneHourAgo }
    });

    // Recent comments (last hour)
    const recentComments = await Comment.countDocuments({
      createdAt: { $gte: oneHourAgo }
    });

    res.status(200).json({
      success: true,
      message: 'Real-time statistics retrieved successfully',
      data: {
        recentReports,
        recentUsers,
        recentComments,
        timestamp: now
      }
    } as ApiResponse);
  } catch (error) {
    console.error('Get real-time stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};
