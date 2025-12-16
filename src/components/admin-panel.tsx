import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit, 
  Trash2, 
  Filter,
  Search,
  AlertTriangle,
  Users,
  TrendingUp,
  Eye,
  MapPin,
  RefreshCw,
  Bell,
  BellRing
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PhotoViewer } from './photo-viewer';
import { WaterAnalytics } from './water-analytics';
import { UserManagement } from './user-management';
import { adminAPI, reportsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { DisasterReport } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from 'sonner';

interface AdminStats {
  total: number;
  critical: number;
  pending: number;
  verified: number;
  rejected: number;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-500';
    case 'HIGH': return 'bg-red-500';
    case 'MEDIUM': return 'bg-yellow-500';
    case 'LOW': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'VERIFIED': return 'text-green-600 bg-green-50 dark:bg-green-950/20';
    case 'PENDING': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
    case 'REJECTED': return 'text-red-600 bg-red-50 dark:bg-red-950/20';
    default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
  }
};

export function AdminPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    total: 0,
    critical: 0,
    pending: 0,
    verified: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [photoViewer, setPhotoViewer] = useState<{
    isOpen: boolean;
    imageUrl: string;
    imageAlt: string;
  }>({
    isOpen: false,
    imageUrl: '',
    imageAlt: ''
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newReportNotification, setNewReportNotification] = useState<DisasterReport | null>(null);
  const [hasNewReports, setHasNewReports] = useState(false);
  const [verifyingReports, setVerifyingReports] = useState<Set<string>>(new Set());
  const [editingReport, setEditingReport] = useState<DisasterReport | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    severity: '',
    location: ''
  });

  // WebSocket connection for real-time updates
  const { isConnected, sendMessage } = useWebSocket({
    url: 'ws://localhost:5000/ws',
    onMessage: (data) => {
      console.log('WebSocket message received:', data);
      if (data.type === 'NEW_REPORT') {
        handleNewReport(data.report);
      } else if (data.type === 'REPORT_UPDATED') {
        handleReportUpdate(data.report);
      } else if (data.type === 'REPORT_DELETED') {
        handleReportDeletion(data.reportId);
      }
    },
    onOpen: () => {
      console.log('WebSocket connected to admin panel');
      // Send admin authentication message
      if (user?.token) {
        sendMessage({
          type: 'ADMIN_AUTH',
          token: user.token,
          role: user.role
        });
      }
    },
    onClose: () => {
      console.log('WebSocket disconnected from admin panel');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  });

  // Handle new report from WebSocket
  const handleNewReport = (newReport: DisasterReport) => {
    console.log('New report received:', newReport);
    setReports(prevReports => [newReport, ...prevReports]);
    
    // Update stats
    setAdminStats(prevStats => ({
      ...prevStats,
      total: prevStats.total + 1,
      pending: prevStats.pending + 1,
      critical: newReport.severity === 'CRITICAL' ? prevStats.critical + 1 : prevStats.critical
    }));

    // Show notification
    setNewReportNotification(newReport);
    setHasNewReports(true);
    
    // Show toast notification
    toast.success(`New report: "${newReport.title}"`, {
      description: `Severity: ${newReport.severity} • Location: ${newReport.location}`,
      duration: 5000,
    });

    // Auto-hide notification after 10 seconds
    setTimeout(() => {
      setNewReportNotification(null);
    }, 10000);
  };

  // Handle report update from WebSocket
  const handleReportUpdate = (updatedReport: DisasterReport) => {
    setReports(prevReports => 
      prevReports.map(report => 
        report._id === updatedReport._id ? updatedReport : report
      )
    );
    
    // Update stats based on status change
    setAdminStats(prevStats => {
      const oldReport = reports.find(r => r._id === updatedReport._id);
      if (!oldReport) return prevStats;

      const stats = { ...prevStats };
      
      // Update status counts
      if (oldReport.status !== updatedReport.status) {
        if (oldReport.status === 'PENDING') stats.pending--;
        if (oldReport.status === 'VERIFIED') stats.verified--;
        if (oldReport.status === 'REJECTED') stats.rejected--;
        
        if (updatedReport.status === 'PENDING') stats.pending++;
        if (updatedReport.status === 'VERIFIED') stats.verified++;
        if (updatedReport.status === 'REJECTED') stats.rejected++;
      }
      
      return stats;
    });
  };

  // Handle report deletion from WebSocket
  const handleReportDeletion = (reportId: string) => {
    setReports(prevReports => {
      const deletedReport = prevReports.find(r => r._id === reportId);
      if (!deletedReport) return prevReports;

      const newReports = prevReports.filter(r => r._id !== reportId);
      
      // Update stats
      setAdminStats(prevStats => ({
        ...prevStats,
        total: prevStats.total - 1,
        pending: deletedReport.status === 'PENDING' ? prevStats.pending - 1 : prevStats.pending,
        verified: deletedReport.status === 'VERIFIED' ? prevStats.verified - 1 : prevStats.verified,
        rejected: deletedReport.status === 'REJECTED' ? prevStats.rejected - 1 : prevStats.rejected,
        critical: deletedReport.severity === 'CRITICAL' ? prevStats.critical - 1 : prevStats.critical
      }));

      return newReports;
    });
  };

  // Fetch reports data
  const fetchReports = async (params?: {
    severity?: string;
    status?: string;
    search?: string;
  }) => {
    if (!user?.token) {
      console.log('No user token available');
      return;
    }
    
    try {
      setRefreshing(true);
      console.log('Fetching reports with params:', params);
      console.log('User role:', user.role);
      
      // Try admin API first
      let response;
      try {
        response = await adminAPI.getAllReports(user.token, {
          page: 1,
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          ...params
        });
        console.log('Admin API response:', response);
        
        // Check if admin API returned an error
        if (!response.success) {
          throw new Error(response.message || 'Admin API failed');
        }
      } catch (adminError) {
        console.log('Admin API failed, trying regular reports API:', adminError);
        // Fallback to regular reports API if admin API fails
        response = await reportsAPI.getReports({
          page: 1,
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          ...params
        });
        console.log('Regular API response:', response);
      }

      if (response.success) {
        setReports(response.data || []);
        if (response.stats) {
          setAdminStats(response.stats);
        } else {
          // Calculate stats from reports if not provided
          const stats = {
            total: response.data?.length || 0,
            critical: response.data?.filter((r: any) => r.severity === 'CRITICAL').length || 0,
            pending: response.data?.filter((r: any) => r.status === 'PENDING').length || 0,
            verified: response.data?.filter((r: any) => r.status === 'VERIFIED').length || 0,
            rejected: response.data?.filter((r: any) => r.status === 'REJECTED').length || 0
          };
          setAdminStats(stats);
        }
        setLastRefresh(new Date());
        console.log('Reports loaded successfully:', response.data?.length || 0);
      } else {
        console.error('API response failed:', response.message);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchReports();
  }, [user?.token]);

  // Refresh data when filters change
  useEffect(() => {
    const params: any = {};
    if (filterSeverity !== 'all') params.severity = filterSeverity;
    if (filterStatus !== 'all') params.status = filterStatus;
    if (searchQuery) params.search = searchQuery;
    
    fetchReports(params);
  }, [filterSeverity, filterStatus, searchQuery, user?.token]);

  // Auto-refresh every 2 minutes for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        const params: any = {};
        if (filterSeverity !== 'all') params.severity = filterSeverity;
        if (filterStatus !== 'all') params.status = filterStatus;
        if (searchQuery) params.search = searchQuery;
        
        fetchReports(params);
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [filterSeverity, filterStatus, searchQuery, refreshing, user?.token]);

  // Client-side filtering for location (since backend doesn't support location filtering yet)
  const filteredReports = reports.filter(report => {
    const matchesLocation = filterLocation === 'all' || report.location.includes(filterLocation);
    return matchesLocation;
  });

  const handleVerifyReport = async (reportId: string) => {
    if (!user?.token || user.role !== 'admin') {
      toast.error('Access denied', {
        description: 'Only admin users can verify reports.',
      });
      return;
    }
    
    // Add to verifying set
    setVerifyingReports(prev => new Set(prev).add(reportId));
    
    try {
      let response;
      try {
        response = await adminAPI.verifyReport(user.token, reportId, 'VERIFIED');
      } catch (adminError) {
        console.log('Admin verify failed, trying regular update:', adminError);
        // Fallback to regular update API
        response = await reportsAPI.updateReport(user.token, reportId, { status: 'VERIFIED' });
      }
      
      if (response.success) {
        // Update local state immediately for better UX
        setReports(prevReports => 
          prevReports.map(report => 
            report._id === reportId 
              ? { ...report, status: 'VERIFIED' as const, verifiedBy: user._id, verifiedAt: new Date() }
              : report
          )
        );
        
        // Update stats
        setAdminStats(prevStats => ({
          ...prevStats,
          pending: prevStats.pending - 1,
          verified: prevStats.verified + 1
        }));
        
        toast.success('Report verified successfully', {
          description: 'The report has been marked as verified and is now visible to all users.',
        });
        
        // Send WebSocket update
        sendMessage({
          type: 'REPORT_VERIFIED',
          reportId,
          verifiedBy: user.name,
          verifiedAt: new Date().toISOString()
        });
      } else {
        toast.error('Failed to verify report', {
          description: response.message || 'An error occurred while verifying the report.',
        });
      }
    } catch (error) {
      console.error('Error verifying report:', error);
      toast.error('Error verifying report', {
        description: 'Please try again or contact support if the issue persists.',
      });
    } finally {
      // Remove from verifying set
      setVerifyingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleRejectReport = async (reportId: string) => {
    if (!user?.token || user.role !== 'admin') {
      toast.error('Access denied', {
        description: 'Only admin users can reject reports.',
      });
      return;
    }
    
    // Add to verifying set
    setVerifyingReports(prev => new Set(prev).add(reportId));
    
    try {
      let response;
      try {
        response = await adminAPI.verifyReport(user.token, reportId, 'REJECTED');
      } catch (adminError) {
        console.log('Admin reject failed, trying regular update:', adminError);
        // Fallback to regular update API
        response = await reportsAPI.updateReport(user.token, reportId, { status: 'REJECTED' });
      }
      
      if (response.success) {
        // Update local state immediately for better UX
        setReports(prevReports => 
          prevReports.map(report => 
            report._id === reportId 
              ? { ...report, status: 'REJECTED' as const, verifiedBy: user._id, verifiedAt: new Date() }
              : report
          )
        );
        
        // Update stats
        setAdminStats(prevStats => ({
          ...prevStats,
          pending: prevStats.pending - 1,
          rejected: prevStats.rejected + 1
        }));
        
        toast.success('Report rejected', {
          description: 'The report has been marked as rejected and will not be visible to users.',
        });
        
        // Send WebSocket update
        sendMessage({
          type: 'REPORT_REJECTED',
          reportId,
          rejectedBy: user.name,
          rejectedAt: new Date().toISOString()
        });
      } else {
        toast.error('Failed to reject report', {
          description: response.message || 'An error occurred while rejecting the report.',
        });
      }
    } catch (error) {
      console.error('Error rejecting report:', error);
      toast.error('Error rejecting report', {
        description: 'Please try again or contact support if the issue persists.',
      });
    } finally {
      // Remove from verifying set
      setVerifyingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!user?.token || user.role !== 'admin') {
      toast.error('Access denied', {
        description: 'Only admin users can delete reports.',
      });
      return;
    }
    
    try {
      const response = await reportsAPI.deleteReport(user.token, reportId);
      if (response.success) {
        // Update local state immediately for better UX
        setReports(prevReports => 
          prevReports.filter(report => report._id !== reportId)
        );
        
        // Update stats
        setAdminStats(prevStats => ({
          ...prevStats,
          total: prevStats.total - 1,
          pending: prevStats.pending - (reports.find(r => r._id === reportId)?.status === 'PENDING' ? 1 : 0),
          verified: prevStats.verified - (reports.find(r => r._id === reportId)?.status === 'VERIFIED' ? 1 : 0),
          rejected: prevStats.rejected - (reports.find(r => r._id === reportId)?.status === 'REJECTED' ? 1 : 0)
        }));
        
        toast.success('Report deleted successfully');
      } else {
        toast.error('Failed to delete report', {
          description: response.message || 'An error occurred while deleting the report.',
        });
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error deleting report', {
        description: 'Please try again or contact support if the issue persists.',
      });
    }
  };

  const handleEditReport = (report: DisasterReport) => {
    if (!user?.token || user.role !== 'admin') {
      toast.error('Access denied', {
        description: 'Only admin users can edit reports.',
      });
      return;
    }
    setEditingReport(report);
    setEditFormData({
      title: report.title,
      description: report.description,
      severity: report.severity,
      location: report.location
    });
  };

  const handleEditSubmit = async () => {
    if (!user?.token || user.role !== 'admin' || !editingReport) {
      toast.error('Access denied', {
        description: 'Only admin users can edit reports.',
      });
      return;
    }
    
    try {
      const response = await reportsAPI.updateReport(user.token, editingReport._id, editFormData);
      
      if (response.success) {
        // Update local state immediately for better UX
        setReports(prevReports => 
          prevReports.map(report => 
            report._id === editingReport._id 
              ? { ...report, ...editFormData }
              : report
          )
        );
        
        toast.success('Report updated successfully');
        setEditingReport(null);
        setEditFormData({ title: '', description: '', severity: '', location: '' });
      } else {
        toast.error('Failed to update report', {
          description: response.message || 'An error occurred while updating the report.',
        });
      }
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Error updating report', {
        description: 'Please try again or contact support if the issue persists.',
      });
    }
  };

  const handleEditCancel = () => {
    setEditingReport(null);
    setEditFormData({ title: '', description: '', severity: '', location: '' });
  };

  const handleImageClick = (imageUrl: string, imageAlt: string) => {
    setPhotoViewer({
      isOpen: true,
      imageUrl,
      imageAlt
    });
  };

  const closePhotoViewer = () => {
    setPhotoViewer({
      isOpen: false,
      imageUrl: '',
      imageAlt: ''
    });
  };

  // Show loading or not authenticated message
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Report Notification */}
      {newReportNotification && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BellRing className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    New Report Received
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    "{newReportNotification.title}" - {newReportNotification.severity} severity
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNewReportNotification(null)}
                className="text-blue-600 hover:text-blue-700"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent flex items-center space-x-2">
            <Shield className="w-8 h-8 text-red-600" />
            <span>Admin Panel</span>
            {isConnected && (
              <div className="flex items-center space-x-1 ml-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-normal">Live</span>
              </div>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Disaster Management Team Dashboard
            {lastRefresh && (
              <span className="text-xs text-gray-500 ml-2">
                • Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            User: {user.name} ({user.role})
            {hasNewReports && (
              <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                • New reports available
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchReports();
              setHasNewReports(false);
            }}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Badge className="bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400">
            Admin Access
          </Badge>
          {!isConnected && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              <Bell className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Manage Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Critical Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-8 h-8 text-red-700 dark:text-red-300" />
                  <div>
                    <div className="text-2xl font-bold text-red-950 dark:text-red-50">{adminStats.critical}</div>
                    <p className="text-xs text-red-700 dark:text-red-300">Immediate attention needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-100 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Pending Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Clock className="w-8 h-8 text-yellow-700 dark:text-yellow-300" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-950 dark:text-yellow-50">{adminStats.pending}</div>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">Awaiting verification</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-100 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Community Votes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-blue-700 dark:text-blue-300" />
                  <div>
                    <div className="text-2xl font-bold text-blue-950 dark:text-blue-50">{adminStats.verified}</div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Verified reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-8 h-8 text-green-700 dark:text-green-300" />
                  <div>
                    <div className="text-2xl font-bold text-green-950 dark:text-green-50">{adminStats.total}</div>
                    <p className="text-xs text-green-700 dark:text-green-300">Total reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Loading reports...</p>
                  </div>
                ) : filteredReports.slice(0, 5).map((report) => (
                  <div key={report._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={report.authorAvatar} />
                        <AvatarFallback>{report.authorName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{report.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {report.authorName} • {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`${getSeverityColor(report.severity)} text-white border-0 text-xs`}>
                        {report.severity}
                      </Badge>
                      <Badge variant="secondary" className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reports, locations, or reporters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('admin.filterBySeverity')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.allSeverities')}</SelectItem>
                  <SelectItem value="CRITICAL">{t('reports.critical')}</SelectItem>
                  <SelectItem value="HIGH">{t('reports.high')}</SelectItem>
                  <SelectItem value="MEDIUM">{t('reports.medium')}</SelectItem>
                  <SelectItem value="LOW">{t('reports.low')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('admin.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.allStatuses')}</SelectItem>
                  <SelectItem value="VERIFIED">{t('reports.verified')}</SelectItem>
                  <SelectItem value="PENDING">{t('reports.pending')}</SelectItem>
                  <SelectItem value="REJECTED">{t('reports.rejected')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('admin.filterByLocation')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.allLocations')}</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Goa">Goa</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Kochi">Kochi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mt-2">Loading reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No reports found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || filterSeverity !== 'all' || filterStatus !== 'all' || filterLocation !== 'all'
                    ? 'Try adjusting your filters to see more reports.'
                    : 'No disaster reports have been submitted yet.'}
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <Card key={report._id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Media Thumbnail */}
                      {report.media && (
                        <div className="w-24 h-18 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                             onClick={() => handleImageClick(report.media.url, report.title)}>
                          <ImageWithFallback 
                            src={report.media.url} 
                            alt={report.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{report.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{report.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(report.createdAt).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{report.views} views</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`${getSeverityColor(report.severity)} text-white border-0 text-xs`}>
                              {report.severity}
                            </Badge>
                            <Badge variant="secondary" className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {report.description}
                        </p>

                        {/* Reporter Info */}
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={report.authorAvatar} />
                            <AvatarFallback className="text-xs">{report.authorName?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Reported by {report.authorName}
                          </span>
                          <span className="text-sm text-gray-500">
                            • {report.votes.up} upvotes, {report.votes.down} downvotes
                          </span>
                        </div>

                        {/* Admin Actions */}
                        {user?.role === 'admin' && (
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex space-x-2">
                            {report.status === 'PENDING' && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 text-white border border-green-600 hover:border-green-700"
                                  onClick={() => handleVerifyReport(report._id)}
                                  disabled={verifyingReports.has(report._id)}
                                >
                                  {verifyingReports.has(report._id) ? (
                                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                  )}
                                  {verifyingReports.has(report._id) ? 'Verifying...' : 'Verify'}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  onClick={() => handleRejectReport(report._id)}
                                  disabled={verifyingReports.has(report._id)}
                                >
                                  {verifyingReports.has(report._id) ? (
                                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4 mr-1" />
                                  )}
                                  {verifyingReports.has(report._id) ? 'Processing...' : 'Reject'}
                                </Button>
                              </>
                            )}
                            {report.status === 'VERIFIED' && (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {report.status === 'REJECTED' && (
                              <Badge className="bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400">
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejected
                              </Badge>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditReport(report)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                          
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteReport(report._id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <WaterAnalytics />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
      
      {/* Photo Viewer */}
      <PhotoViewer
        isOpen={photoViewer.isOpen}
        onClose={closePhotoViewer}
        imageUrl={photoViewer.imageUrl}
        imageAlt={photoViewer.imageAlt}
      />

      {/* Edit Report Modal */}
      {editingReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Report</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Report title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Report description"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Severity</label>
                <Select value={editFormData.severity} onValueChange={(value) => setEditFormData(prev => ({ ...prev, severity: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  value={editFormData.location}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Report location"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={handleEditCancel}>
                Cancel
              </Button>
              <Button onClick={handleEditSubmit}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}