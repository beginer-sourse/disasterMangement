import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  TrendingUp, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Filter,
  Search,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CommentSection } from './comment-section';
import { reportsAPI, DisasterReport } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const severityColors = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  HIGH: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
};

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  VERIFIED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
};

const disasterTypeColors = {
  earthquake: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  fire: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  flood: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  storm: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  cyclone: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
  oilSpill: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
};

export function Reports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchReports();
  }, [severityFilter, statusFilter, sortBy, sortOrder]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: 1,
        limit: 20,
        sortBy,
        sortOrder
      };
      
      if (severityFilter !== 'all') {
        params.severity = severityFilter;
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await reportsAPI.getReports(params);
      
      if (response.success) {
        setReports(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle className="w-4 h-4" />;
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-4 h-4" />;
      case 'LOW':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Disaster Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Real-time disaster reports from citizens
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Disaster Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Real-time disaster reports from citizens
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredReports.length} reports found
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-sky-50/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t('reports.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('reports.severity')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('reports.allSeverities')}</SelectItem>
                <SelectItem value="LOW">{t('reports.low')}</SelectItem>
                <SelectItem value="MEDIUM">{t('reports.medium')}</SelectItem>
                <SelectItem value="HIGH">{t('reports.high')}</SelectItem>
                <SelectItem value="CRITICAL">{t('reports.critical')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('reports.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('reports.allStatuses')}</SelectItem>
                <SelectItem value="PENDING">{t('reports.pending')}</SelectItem>
                <SelectItem value="VERIFIED">{t('reports.verified')}</SelectItem>
                <SelectItem value="REJECTED">{t('reports.rejected')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}>
              <SelectTrigger>
                <SelectValue placeholder={t('reports.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="severity-desc">Severity High to Low</SelectItem>
                <SelectItem value="severity-asc">Severity Low to High</SelectItem>
                <SelectItem value="views-desc">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <Card className="bg-sky-50/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-12">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Reports Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || severityFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your filters to see more reports.'
                  : 'No disaster reports have been submitted yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card key={report._id} className="bg-sky-50/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {report.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{report.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Badge className={severityColors[report.severity]}>
                      {getSeverityIcon(report.severity)}
                      <span className="ml-1">{report.severity}</span>
                    </Badge>
                    <Badge className={statusColors[report.status]}>
                      {getStatusIcon(report.status)}
                      <span className="ml-1">{report.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                  {report.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{report.views}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{report.votes.up}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      <MessageCircle className="w-4 h-4" />
                      <span>{report.comments.length}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(report.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={disasterTypeColors[report.disasterType as keyof typeof disasterTypeColors] || 'bg-gray-100 text-gray-800'}>
                    {report.disasterType}
                  </Badge>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>by {report.authorName}</span>
                  </div>
                </div>

                {/* Comment Section */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <CommentSection 
                    reportId={report._id}
                    initialComments={report.comments || []}
                    onCommentAdded={(comment) => {
                      // Update the report's comment count
                      setReports(reports.map(r => 
                        r._id === report._id 
                          ? { ...r, comments: [...(r.comments || []), comment] }
                          : r
                      ));
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}