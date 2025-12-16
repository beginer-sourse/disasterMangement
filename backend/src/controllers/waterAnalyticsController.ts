import { Request, Response } from 'express';
import DisasterReport from '../models/DisasterReport';
import User from '../models/User';
import Comment from '../models/Comment';
import { ApiResponse } from '../types';

// Ocean and water-related disaster types (matching database schema)
const OCEAN_DISASTER_TYPES = [
  'Flood', 'Tsunami', 'Oil Spill', 'Coastal Erosion', 
  'High Waves', 'Storm Surge', 'Water Pollution', 'Marine Debris',
  'Cyclone'
];

export const getWaterAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get ocean and water-related reports
    const oceanReports = await DisasterReport.find({
      disasterType: { $in: OCEAN_DISASTER_TYPES },
      createdAt: { $gte: startDate }
    });

    // Calculate metrics
    const totalReports = oceanReports.length;
    const verifiedReports = oceanReports.filter(r => r.status === 'VERIFIED').length;
    const pendingReports = oceanReports.filter(r => r.status === 'PENDING').length;
    const rejectedReports = oceanReports.filter(r => r.status === 'REJECTED').length;
    
    const verificationRate = totalReports > 0 ? Math.round((verifiedReports / totalReports) * 100) : 0;
    
    // Calculate average response time (time from creation to verification)
    const verifiedWithTime = oceanReports.filter(r => r.status === 'VERIFIED' && r.verifiedAt);
    const avgResponseTime = verifiedWithTime.length > 0 
      ? Math.round(verifiedWithTime.reduce((sum, r) => {
          const responseTime = new Date(r.verifiedAt!).getTime() - new Date(r.createdAt).getTime();
          return sum + responseTime;
        }, 0) / verifiedWithTime.length / (1000 * 60)) // Convert to minutes
      : 0;

    // Get active users (users who created ocean reports in time range)
    // Filter out invalid author IDs and get unique valid ObjectIds
    const activeUserIds = [...new Set(
      oceanReports
        .map(r => r.author)
        .filter(authorId => {
          // Check if it's a valid ObjectId string (24 hex characters)
          return typeof authorId === 'string' && /^[0-9a-fA-F]{24}$/.test(authorId);
        })
    )];
    
    const activeUsers = activeUserIds.length > 0 ? await User.countDocuments({
      _id: { $in: activeUserIds }
    }) : 0;

    // Get disaster trends over time
    const trendsData = await getDisasterTrendsData(startDate, now);
    
    // Get severity distribution
    const severityData = getSeverityDistribution(oceanReports);
    
    // Get response time by hour
    const responseTimeData = await getResponseTimeByHour(oceanReports);
    
    // Get user participation growth
    const participationData = await getUserParticipationGrowth(startDate, now);

    const analytics = {
      metrics: {
        totalReports,
        avgResponseTime: `${avgResponseTime}m`,
        verificationRate: `${verificationRate}%`,
        activeUsers,
        pendingReports,
        verifiedReports,
        rejectedReports
      },
      trends: trendsData,
      severity: severityData,
      responseTime: responseTimeData,
      participation: participationData,
      lastUpdated: new Date()
    };

    res.status(200).json({
      success: true,
      message: 'Water analytics retrieved successfully',
      data: analytics
    } as ApiResponse);
  } catch (error) {
    console.error('Water analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

async function getDisasterTrendsData(startDate: Date, endDate: Date) {
  const trends = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayReports = await DisasterReport.find({
      disasterType: { $in: OCEAN_DISASTER_TYPES },
      createdAt: { $gte: currentDate, $lt: nextDate }
    });
    
    const dayData = {
      date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      floods: 0,
      tsunamis: 0,
      oilSpills: 0,
      coastalErosion: 0,
      highWaves: 0,
      stormSurge: 0,
      waterPollution: 0,
      marineDebris: 0,
      cyclones: 0
    };
    
    dayReports.forEach(report => {
      switch (report.disasterType) {
        case 'Flood':
          dayData.floods++;
          break;
        case 'Tsunami':
          dayData.tsunamis++;
          break;
        case 'Oil Spill':
          dayData.oilSpills++;
          break;
        case 'Coastal Erosion':
          dayData.coastalErosion++;
          break;
        case 'High Waves':
          dayData.highWaves++;
          break;
        case 'Storm Surge':
          dayData.stormSurge++;
          break;
        case 'Water Pollution':
          dayData.waterPollution++;
          break;
        case 'Marine Debris':
          dayData.marineDebris++;
          break;
        case 'Cyclone':
          dayData.cyclones++;
          break;
      }
    });
    
    trends.push(dayData);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return trends;
}

function getSeverityDistribution(reports: any[]) {
  const severityCounts = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0
  };
  
  reports.forEach(report => {
    severityCounts[report.severity as keyof typeof severityCounts]++;
  });
  
  const total = reports.length;
  if (total === 0) {
    return [
      { name: 'Low', value: 0, color: '#10B981' },
      { name: 'Medium', value: 0, color: '#3B82F6' },
      { name: 'High', value: 0, color: '#F97316' },
      { name: 'Critical', value: 0, color: '#EF4444' }
    ];
  }
  
  return [
    { 
      name: 'Low', 
      value: Math.round((severityCounts.LOW / total) * 100), 
      color: '#10B981' 
    },
    { 
      name: 'Medium', 
      value: Math.round((severityCounts.MEDIUM / total) * 100), 
      color: '#3B82F6' 
    },
    { 
      name: 'High', 
      value: Math.round((severityCounts.HIGH / total) * 100), 
      color: '#F97316' 
    },
    { 
      name: 'Critical', 
      value: Math.round((severityCounts.CRITICAL / total) * 100), 
      color: '#EF4444' 
    }
  ];
}

async function getResponseTimeByHour(reports: any[]) {
  const hourlyData = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const hourReports = reports.filter(report => {
      const reportHour = new Date(report.createdAt).getHours();
      return reportHour === hour && report.status === 'VERIFIED' && report.verifiedAt;
    });
    
    if (hourReports.length > 0) {
      const avgTime = hourReports.reduce((sum, report) => {
        const responseTime = new Date(report.verifiedAt).getTime() - new Date(report.createdAt).getTime();
        return sum + responseTime;
      }, 0) / hourReports.length / (1000 * 60); // Convert to minutes
      
      hourlyData.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        time: Math.round(avgTime)
      });
    } else {
      hourlyData.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        time: 0
      });
    }
  }
  
  return hourlyData;
}

async function getUserParticipationGrowth(startDate: Date, endDate: Date) {
  const participation = [];
  const currentDate = new Date(startDate);
  
  // Group by weeks
  while (currentDate <= endDate) {
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const weekReports = await DisasterReport.find({
      disasterType: { $in: OCEAN_DISASTER_TYPES },
      createdAt: { $gte: currentDate, $lt: weekEnd }
    });
    
    // Filter valid ObjectIds for unique users count
    const uniqueUserIds = weekReports
      .map(r => r.author)
      .filter(authorId => {
        return typeof authorId === 'string' && /^[0-9a-fA-F]{24}$/.test(authorId);
      });
    const uniqueUsers = new Set(uniqueUserIds);
    
    participation.push({
      week: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      reports: weekReports.length,
      users: uniqueUsers.size,
      verified: weekReports.filter(r => r.status === 'VERIFIED').length
    });
    
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return participation;
}
