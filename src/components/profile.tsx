import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Clock, 
  Edit, 
  Trash2, 
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  FileText,
  Camera,
  Calendar,
  Phone,
  Mail,
  LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PhotoViewer } from './photo-viewer';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, reportsAPI, DisasterReport } from '../services/api';
import { toast } from 'sonner';

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'VERIFIED': return CheckCircle;
    case 'PENDING': return AlertTriangle;
    case 'REJECTED': return XCircle;
    default: return AlertTriangle;
  }
};

export function Profile() {
  const { user, logout } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [userReports, setUserReports] = useState<DisasterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0
  });
  const [userProfile, setUserProfile] = useState({
    name: user?.name || 'Loading...',
    email: user?.email || 'Loading...',
    phone: user?.phone || 'Not provided',
    location: 'Mumbai, Maharashtra', // This could be added to user model
    joinedDate: 'March 2024', // This could be calculated from user creation date
    avatar: user?.avatar || '/avatars/default.png'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: ''
  });
  const [photoViewer, setPhotoViewer] = useState({
    isOpen: false,
    imageUrl: '',
    imageAlt: ''
  });

  useEffect(() => {
    if (user) {
      setUserProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || 'Not provided',
        avatar: user.avatar || '/avatars/default.png'
      }));
      setEditData({
        name: user.name,
        phone: user.phone || ''
      });
      fetchUserReports();
    }
  }, [user, filterStatus]);

  const fetchUserReports = async () => {
    if (!user?.token) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await reportsAPI.getUserReports(user.token, {
        status: filterStatus === 'all' ? undefined : filterStatus,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (response.success) {
        setUserReports(response.data);
        if (response.stats) {
          setUserStats(response.stats);
        }
      } else {
        toast.error(response.message || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Failed to fetch user reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!user?.token) return;
    
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await reportsAPI.deleteReport(user.token, reportId);
      
      if (response.success) {
        toast.success('Report deleted successfully');
        fetchUserReports(); // Refresh the list
      } else {
        toast.error(response.message || 'Failed to delete report');
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error('Failed to delete report');
    }
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

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await authAPI.updateProfile(user?.token || '', editData);
      if (response.success) {
        setUserProfile(prev => ({
          ...prev,
          name: editData.name,
          phone: editData.phone || 'Not provided'
        }));
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const filteredReports = userReports;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your reports and account information
          </p>
        </div>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="profile">Profile Info</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="status-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
                    <p className="text-xl font-bold">{userStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="status-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-950/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
                    <p className="text-xl font-bold">{userStats.verified}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="status-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-950/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-xl font-bold">{userStats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="status-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-950/20 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
                    <p className="text-xl font-bold">{userStats.rejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'card' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('card')}
              >
                Card View
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List View
              </Button>
            </div>
          </div>

          {/* Reports Grid/List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-4">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Reports Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filterStatus === 'all' 
                  ? "You haven't created any reports yet." 
                  : `No ${filterStatus.toLowerCase()} reports found.`
                }
              </p>
            </div>
          ) : (
            <div className={viewMode === 'card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
              {filteredReports.map((report) => {
                const StatusIcon = getStatusIcon(report.status);
              
              if (viewMode === 'list') {
                return (
                  <Card key={report._id} className="bg-sky-50/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          {report.media?.url && (
                            <div className="w-16 h-12 rounded overflow-hidden">
                              <ImageWithFallback 
                                src={report.media.url} 
                                alt={report.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold">{report.title}</h3>
                              <Badge variant="outline" className={`${getSeverityColor(report.severity)} text-white border-0 text-xs`}>
                                {report.severity}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{report.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{getTimeAgo(report.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className={getStatusColor(report.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {report.status}
                          </Badge>
                          
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteReport(report._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card key={report._id} className="bg-sky-50/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{report.title}</h3>
                          {report.media?.url && <Camera className="w-4 h-4 text-gray-500" />}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={`${getSeverityColor(report.severity)} text-white border-0 text-xs`}>
                            {report.severity}
                          </Badge>
                          <Badge variant="secondary" className={getStatusColor(report.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {report.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Image */}
                      {report.media?.url && (
                        <div 
                          className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => handleImageClick(report.media.url, report.title)}
                        >
                          <ImageWithFallback 
                            src={report.media.url} 
                            alt={report.title}
                            className="w-full h-40 object-cover"
                          />
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {report.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{report.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{getTimeAgo(report.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteReport(report._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1 bg-sky-50/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback className="text-xl">{userProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mb-1">{userProfile.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{userProfile.location}</p>
                <div className="flex items-center justify-center space-x-1 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {userProfile.joinedDate}</span>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={handleEditProfile}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="lg:col-span-2 bg-sky-50/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email Address</Label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{userProfile.email}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone Number</Label>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <input
                          type="tel"
                          value={editData.phone}
                          onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                          placeholder="Enter phone number"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{userProfile.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Name</Label>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                          placeholder="Enter your name"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{userProfile.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Member Since</Label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{userProfile.joinedDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleEditProfile} className="w-full md:w-auto">
                      <Edit className="w-4 h-4 mr-2" />
                      Update Information
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-sky-50/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates about your reports</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Emergency Alerts</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Critical disaster notifications in your area</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Report Status Updates</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when your reports are reviewed</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Photo Viewer */}
      <PhotoViewer
        isOpen={photoViewer.isOpen}
        onClose={closePhotoViewer}
        imageUrl={photoViewer.imageUrl}
        imageAlt={photoViewer.imageAlt}
      />
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}