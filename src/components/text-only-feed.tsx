import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  MapPin, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { reportsAPI, DisasterReport } from '../services/api';

// Helper function to format time ago
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

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

export function TextOnlyFeed() {
  const [textReports, setTextReports] = useState<DisasterReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTextReports = async () => {
      try {
        setLoading(true);
        console.log('Fetching text reports...');
        const response = await reportsAPI.getReports({
          limit: 5,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        console.log('Text reports response:', response);
        
        if (response.success) {
          // Filter reports that don't have media (text-only reports)
          const textOnlyReports = response.data.filter((report: DisasterReport) => 
            !report.media || report.media === null || !report.media.url || report.media.url === ''
          );
          console.log('Text only reports:', textOnlyReports);
          setTextReports(textOnlyReports);
        }
      } catch (error) {
        console.error('Failed to fetch text reports:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure backend is ready
    const timer = setTimeout(() => {
      fetchTextReports();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card className="backdrop-blur-md border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Text Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quick text submissions
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading reports...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-md border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Text Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Quick text submissions
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {textReports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No text reports available</p>
          </div>
        ) : (
          textReports.map((report) => (
            <div 
              key={report._id} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-700/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={report.authorAvatar} />
                    <AvatarFallback className="text-xs">{report.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-xs">{report.authorName}</p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeAgo(report.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className={`${getSeverityColor(report.severity)} text-white border-0 text-xs px-1 py-0`}>
                    {report.severity}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{report.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {report.description}
                </p>

                {/* Location */}
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{report.location}</span>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center justify-between pt-1">
                  <Badge variant="secondary" className={`${getStatusColor(report.status)} text-xs`}>
                    {report.status === 'VERIFIED' && <CheckCircle className="w-2 h-2 mr-1" />}
                    {report.status === 'PENDING' && <AlertTriangle className="w-2 h-2 mr-1" />}
                    {report.status}
                  </Badge>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-600 hover:text-green-600">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {report.votes.up}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-600 hover:text-red-600">
                      <ThumbsDown className="w-3 h-3 mr-1" />
                      {report.votes.down}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-600 hover:text-blue-600">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {report.comments.length}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}