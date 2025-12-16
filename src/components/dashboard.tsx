import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Clock,
  TrendingUp,
  TrendingDown,
  Bell,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { PostFeed } from './post-feed';
import { TextOnlyFeed } from './text-only-feed';
import { InfoCards } from './info-cards';
import { dashboardAPI } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { apiCache } from '../utils/apiCache';

interface DashboardStats {
  activeReports: {
    value: number;
    trend: number;
    trendType: 'up' | 'down';
    description: string;
  };
  verifiedIncidents: {
    value: number;
    trend: number;
    trendType: 'up' | 'down';
    description: string;
  };
  activeCitizens: {
    value: number;
    trend: number;
    trendType: 'up' | 'down';
    description: string;
  };
  avgResponseTime: {
    value: number;
    trend: number;
    trendType: 'up' | 'down';
    description: string;
  };
  alertsToday: {
    value: number;
    trend: number;
    trendType: 'up' | 'down';
    description: string;
  };
}

interface DashboardProps {
  selectedState: string;
}

export function Dashboard({ selectedState }: DashboardProps) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCache.get('dashboard-stats', () => dashboardAPI.getDashboardStats());
      
      if (response.success) {
        setStats(response.data);
        setLastUpdated(new Date());
      } else {
        setError(response.message || 'Failed to fetch dashboard statistics');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket for real-time updates
  const { isConnected: wsConnected } = useWebSocket({
    url: 'ws://localhost:5000',
    onMessage: (data) => {
      if (data.type === 'dashboard_update') {
        setStats(data.stats);
        setLastUpdated(new Date());
      }
    },
    onOpen: () => {
      console.log('WebSocket connected for real-time updates');
    },
    onClose: () => {
      console.log('WebSocket disconnected');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
  });

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 2 minutes (fallback if WebSocket is not available)
    const interval = setInterval(fetchStats, 120000);
    
    return () => clearInterval(interval);
  }, []);

  const formatValue = (value: number, type: string) => {
    if (type === 'avgResponseTime') {
      return `${value}m`;
    }
    return value.toLocaleString();
  };

  const formatTrend = (trend: number, type: string) => {
    if (type === 'avgResponseTime') {
      return `${Math.abs(trend)}m`;
    }
    return `${trend > 0 ? '+' : ''}${trend}%`;
  };

  const statsConfig = [
    {
      key: 'activeReports' as keyof DashboardStats,
      title: t('dashboard.activeReports'),
      icon: AlertTriangle,
    },
    {
      key: 'verifiedIncidents' as keyof DashboardStats,
      title: t('dashboard.verifiedIncidents'),
      icon: CheckCircle,
    },
    {
      key: 'activeCitizens' as keyof DashboardStats,
      title: t('dashboard.activeCitizens'),
      icon: Users,
    },
    {
      key: 'avgResponseTime' as keyof DashboardStats,
      title: t('dashboard.avgResponseTime'),
      icon: Clock,
    },
    {
      key: 'alertsToday' as keyof DashboardStats,
      title: t('dashboard.alertsToday'),
      icon: Bell,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {t('dashboard.subtitle')}
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              {t('dashboard.lastUpdated')}: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          {/* Debug info */}
          <div className="text-xs text-gray-500 mt-1">
            Language: {i18n.language} | Test: {t('common.loading')}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={fetchStats} 
            disabled={loading}
            variant="outline" 
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            wsConnected 
              ? 'bg-green-50 dark:bg-green-950/20' 
              : 'bg-yellow-50 dark:bg-yellow-950/20'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              wsConnected 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-yellow-500'
            }`}></div>
            <span className={`text-sm ${
              wsConnected 
                ? 'text-green-700 dark:text-green-400' 
                : 'text-yellow-700 dark:text-yellow-400'
            }`}>
              {wsConnected ? 'Real-time Connected' : 'Polling Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Button 
              onClick={fetchStats} 
              variant="outline" 
              size="sm" 
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statsConfig.map((config, index) => {
          const Icon = config.icon;
          const statData = stats?.[config.key];
          
          // Define light color schemes for each card with more visible backgrounds
          const cardColors = [
            {
              bg: '#fed7aa', // orange-100
              border: 'border-orange-300 dark:border-orange-700/50',
              icon: 'text-orange-600 dark:text-orange-400',
              title: 'text-orange-800 dark:text-orange-300',
              value: 'text-orange-900 dark:text-orange-200',
              trend: 'text-orange-700 dark:text-orange-400'
            },
            {
              bg: '#bbf7d0', // green-100
              border: 'border-green-300 dark:border-green-700/50',
              icon: 'text-green-600 dark:text-green-400',
              title: 'text-green-800 dark:text-green-300',
              value: 'text-green-900 dark:text-green-200',
              trend: 'text-green-700 dark:text-green-400'
            },
            {
              bg: '#dbeafe', // blue-100
              border: 'border-blue-300 dark:border-blue-700/50',
              icon: 'text-blue-600 dark:text-blue-400',
              title: 'text-blue-800 dark:text-blue-300',
              value: 'text-blue-900 dark:text-blue-200',
              trend: 'text-blue-700 dark:text-blue-400'
            },
            {
              bg: '#e9d5ff', // purple-100
              border: 'border-purple-300 dark:border-purple-700/50',
              icon: 'text-purple-600 dark:text-purple-400',
              title: 'text-purple-800 dark:text-purple-300',
              value: 'text-purple-900 dark:text-purple-200',
              trend: 'text-purple-700 dark:text-purple-400'
            },
            {
              bg: '#fecaca', // rose-100
              border: 'border-rose-300 dark:border-rose-700/50',
              icon: 'text-rose-600 dark:text-rose-400',
              title: 'text-rose-800 dark:text-rose-300',
              value: 'text-rose-900 dark:text-rose-200',
              trend: 'text-rose-700 dark:text-rose-400'
            }
          ];
          
          const colors = cardColors[index] || cardColors[0];
          
          // Debug log to ensure colors are being applied
          console.log(`Card ${index} (${config.title}): ${colors.bg}`);
          console.log('Applied style:', { backgroundColor: colors.bg });
          
          return (
            <div 
              key={index} 
              className={`dashboard-card-${index + 1} hover:shadow-md transition-all duration-200 backdrop-blur-md ${colors.border} rounded-xl border flex flex-col gap-6`}
              style={{ 
                backgroundColor: colors.bg,
                '--card': colors.bg,
                '--card-foreground': colors.value
              } as React.CSSProperties}
            >
              <div className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
                <h4 className={`text-sm font-medium leading-none ${colors.title}`}>
                  {config.title}
                </h4>
                <Icon className={`h-4 w-4 ${colors.icon}`} />
              </div>
              <div className="px-6 pb-6">
                {loading ? (
                  <div className="animate-pulse">
                    <div 
                      className="h-8 rounded mb-2" 
                      style={{ backgroundColor: colors.bg + '80' }} // Add opacity
                    ></div>
                    <div 
                      className="h-4 rounded w-3/4" 
                      style={{ backgroundColor: colors.bg + '80' }} // Add opacity
                    ></div>
                  </div>
                ) : statData ? (
                  <>
                    <div className={`text-2xl font-bold ${colors.value}`}>
                      {formatValue(statData.value, config.key)}
                    </div>
                    <div className="flex items-center space-x-1 text-xs">
                      {statData.trendType === 'up' ? (
                        <TrendingUp className={`h-3 w-3 ${colors.trend}`} />
                      ) : (
                        <TrendingDown className={`h-3 w-3 ${colors.trend}`} />
                      )}
                      <span className={colors.trend}>
                        {formatTrend(statData.trend, config.key)}
                      </span>
                      <span className={`${colors.title} opacity-70`}>{statData.description}</span>
                    </div>
                  </>
                ) : (
                  <div className={colors.title}>No data available</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Post Feeds */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Post Feed */}
            <div className="xl:col-span-2">
              <PostFeed selectedState={selectedState} />
            </div>
            
            {/* Text-Only Feed */}
            <div className="xl:col-span-1">
              <TextOnlyFeed />
            </div>
          </div>
        </div>

        {/* Info Cards Sidebar */}
        <div className="lg:col-span-1">
          <InfoCards />
        </div>
      </div>
    </div>
  );
}