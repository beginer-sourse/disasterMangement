import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  TrendingDown,
  ChevronDown,
  Droplets,
  Waves,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from 'sonner';

interface WaterAnalyticsData {
  metrics: {
    totalReports: number;
    avgResponseTime: string;
    verificationRate: string;
    activeUsers: number;
    pendingReports: number;
    verifiedReports: number;
    rejectedReports: number;
  };
  trends: Array<{
    date: string;
    floods: number;
    tsunamis: number;
    oilSpills: number;
    coastalErosion: number;
    highWaves: number;
    stormSurge: number;
    waterPollution: number;
    marineDebris: number;
  }>;
  severity: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  responseTime: Array<{
    hour: string;
    time: number;
  }>;
  participation: Array<{
    week: string;
    reports: number;
    users: number;
    verified: number;
  }>;
  lastUpdated: string;
}

export function WaterAnalytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<WaterAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // WebSocket connection for real-time updates
  const { isConnected, sendMessage } = useWebSocket({
    url: 'ws://localhost:5000/ws',
    onMessage: (data) => {
      console.log('WebSocket message received in analytics:', data);
      if (data.type === 'NEW_REPORT' || data.type === 'REPORT_UPDATED' || data.type === 'REPORT_DELETED') {
        // Check if it's an ocean-related disaster
        const oceanDisasterTypes = [
          'Flood', 'Tsunami', 'Oil Spill', 'Coastal Erosion', 'High Waves', 'Storm Surge', 
          'Water Pollution', 'Marine Debris', 'Cyclone', 'Hurricane', 'Sea Level Rise', 
          'Ocean Acidification', 'Coral Bleaching', 'Marine Heatwave', 'Underwater Landslide',
          'Tidal Wave', 'Rip Current', 'Beach Erosion', 'Saltwater Intrusion'
        ];
        if (data.report && oceanDisasterTypes.includes(data.report.disasterType)) {
          fetchAnalytics();
          toast.success('Ocean analytics updated', {
            description: 'New ocean disaster data has been added.',
          });
        }
      }
    },
    onOpen: () => {
      console.log('WebSocket connected to water analytics');
      if (user?.token) {
        sendMessage({
          type: 'AUTHENTICATE',
          token: user.token
        });
      }
    }
  });

  const fetchAnalytics = async () => {
    if (!user?.token) return;
    
    try {
      setLoading(true);
      const response = await analyticsAPI.getWaterAnalytics(user.token, timeRange);
      
      if (response.success) {
        setAnalyticsData(response.data);
        setLastUpdate(new Date());
      } else {
        toast.error('Failed to fetch ocean analytics', {
          description: response.message || 'An error occurred while fetching analytics data.',
        });
      }
    } catch (error) {
      console.error('Error fetching ocean analytics:', error);
      toast.error('Error fetching ocean analytics', {
        description: 'Please try again or contact support if the issue persists.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, user?.token]);

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '24h': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      default: return 'Last 7 Days';
    }
  };

  if (loading && !analyticsData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading water analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No ocean-related disaster data found for the selected time range.
          </p>
        </div>
      </div>
    );
  }

  const metricsData = [
    {
      title: 'Total Ocean Reports',
      value: analyticsData.metrics.totalReports.toString(),
      change: '+12%',
      trend: 'up',
      icon: Droplets,
      description: 'from last week'
    },
    {
      title: 'Avg Response Time',
      value: analyticsData.metrics.avgResponseTime,
      change: '-8%',
      trend: 'down',
      icon: Clock,
      description: 'from last week'
    },
    {
      title: 'Verification Rate',
      value: analyticsData.metrics.verificationRate,
      change: '+5%',
      trend: 'up',
      icon: CheckCircle,
      description: 'from last week'
    },
    {
      title: 'Active Users',
      value: analyticsData.metrics.activeUsers.toLocaleString(),
      change: '+15%',
      trend: 'up',
      icon: Users,
      description: 'from last month'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Ocean Disaster Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Real-time insights into ocean and water-related disaster reporting trends
          </p>
          {lastUpdate && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Waves className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {metric.value}
                    </p>
                    <div className="flex items-center mt-1">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        {metric.description}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disaster Trends Over Time */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle>Ocean Disaster Trends Over Time</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Daily ocean disaster reports by type
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="floods" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Floods" />
                <Area type="monotone" dataKey="tsunamis" stackId="1" stroke="#F97316" fill="#F97316" name="Tsunamis" />
                <Area type="monotone" dataKey="oilSpills" stackId="1" stroke="#EF4444" fill="#EF4444" name="Oil Spills" />
                <Area type="monotone" dataKey="coastalErosion" stackId="1" stroke="#10B981" fill="#10B981" name="Coastal Erosion" />
                <Area type="monotone" dataKey="highWaves" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" name="High Waves" />
                <Area type="monotone" dataKey="stormSurge" stackId="1" stroke="#06B6D4" fill="#06B6D4" name="Storm Surge" />
                <Area type="monotone" dataKey="waterPollution" stackId="1" stroke="#84CC16" fill="#84CC16" name="Water Pollution" />
                <Area type="monotone" dataKey="marineDebris" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Marine Debris" />
                <Area type="monotone" dataKey="cyclones" stackId="1" stroke="#EC4899" fill="#EC4899" name="Cyclones" />
                <Area type="monotone" dataKey="hurricanes" stackId="1" stroke="#DC2626" fill="#DC2626" name="Hurricanes" />
                <Area type="monotone" dataKey="coralBleaching" stackId="1" stroke="#F472B6" fill="#F472B6" name="Coral Bleaching" />
                <Area type="monotone" dataKey="tidalWaves" stackId="1" stroke="#7C3AED" fill="#7C3AED" name="Tidal Waves" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ocean disaster reports by severity level
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.severity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.severity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Time by Hour */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle>Response Time by Hour</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average response time throughout the day
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.responseTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="time" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Participation Growth */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle>User Participation Growth</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Weekly ocean disaster reports and user engagement
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.participation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reports" stroke="#3B82F6" strokeWidth={2} name="Reports" />
                <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} name="Users" />
                <Line type="monotone" dataKey="verified" stroke="#F97316" strokeWidth={2} name="Verified" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
