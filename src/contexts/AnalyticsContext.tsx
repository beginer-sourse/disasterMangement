import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { analyticsAPI, ApiResponse } from '../services/api';
import { useAuth } from './AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';

interface AnalyticsData {
  totalReports: number;
  verifiedReports: number;
  pendingReports: number;
  rejectedReports: number;
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  verificationRate: number;
  avgResponseTime: number; // in minutes
  reportsBySeverity: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  reportsByLocation: Array<{
    location: string;
    count: number;
  }>;
  recentActivity: Array<{
    type: 'report' | 'comment' | 'verification';
    description: string;
    timestamp: Date;
    user?: string;
  }>;
}

interface AnalyticsContextType {
  analytics: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
  lastUpdated: Date | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user, token } = useAuth();

  // WebSocket connection for real-time updates
  const { isConnected, sendMessage } = useWebSocket({
    url: 'ws://localhost:5000/ws',
    onMessage: (data) => {
      switch (data.type) {
        case 'NEW_REPORT':
        case 'REPORT_UPDATED':
        case 'REPORT_VERIFICATION':
        case 'REPORT_DELETED':
        case 'ANALYTICS_UPDATE':
          // Refresh analytics when reports change or analytics update is received
          if (user && token) {
            refreshAnalytics();
          }
          break;
      }
    }
  });

  const refreshAnalytics = async () => {
    if (!token || !user) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response: ApiResponse = await analyticsAPI.getAnalytics(token);
      
      if (response.success && response.data) {
        const data = response.data;
        
        // Calculate verification rate
        const verificationRate = data.reportsStats.totalReports > 0 
          ? Math.round((data.reportsStats.verifiedReports / data.reportsStats.totalReports) * 100)
          : 0;

        // Calculate average response time (mock calculation - you can enhance this)
        // This is a placeholder - in a real app, you'd track actual response times
        const avgResponseTime = Math.round(Math.random() * 60 + 10); // 10-70 minutes

        const analyticsData: AnalyticsData = {
          totalReports: data.reportsStats.totalReports,
          verifiedReports: data.reportsStats.verifiedReports,
          pendingReports: data.reportsStats.pendingReports,
          rejectedReports: data.reportsStats.rejectedReports,
          totalUsers: data.userActivity.totalUsers,
          activeUsers: data.userActivity.activeUsers,
          newUsersThisWeek: data.userActivity.newUsersThisWeek,
          verificationRate,
          avgResponseTime,
          reportsBySeverity: data.reportsBySeverity,
          reportsByLocation: data.reportsByLocation || [],
          recentActivity: data.recentActivity || []
        };

        setAnalytics(analyticsData);
        setLastUpdated(new Date());
      } else {
        setError(response.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
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
    refreshAnalytics();

    // Set up periodic refresh (every 5 minutes)
    const interval = setInterval(refreshAnalytics, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, token, isConnected]);

  const value: AnalyticsContextType = {
    analytics,
    isLoading,
    error,
    refreshAnalytics,
    lastUpdated,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
