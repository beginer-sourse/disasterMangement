import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Filter, 
  Search, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Layers,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { GoogleMap } from './google-map';
import { MarkerPopup } from './marker-popup';
import { reportsAPI, DisasterReport } from '../services/api';
import { toast } from 'sonner';

// Helper function to convert DisasterReport to map marker format
const convertReportToMarker = (report: DisasterReport) => {
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const reportDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - reportDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  console.log('Converting report to marker:', {
    id: report._id,
    title: report.title,
    location: report.location,
    coordinates: report.coordinates,
    severity: report.severity
  });
  
  // Ensure we have valid coordinates
  if (!report.coordinates) {
    console.warn('No coordinates for report:', report._id, report.title);
    return null;
  }
  
  if (typeof report.coordinates.latitude !== 'number' || 
      typeof report.coordinates.longitude !== 'number') {
    console.warn('Invalid coordinate types for report:', report._id, report.coordinates);
    return null;
  }
  
  // Check for valid coordinate ranges
  if (report.coordinates.latitude < -90 || report.coordinates.latitude > 90 ||
      report.coordinates.longitude < -180 || report.coordinates.longitude > 180) {
    console.warn('Coordinates out of valid range for report:', report._id, report.coordinates);
    return null;
  }

  const marker = {
    id: parseInt(report._id.replace(/\D/g, '').slice(-6)) || Math.floor(Math.random() * 1000000), // Convert ObjectId to number
    title: report.title,
    location: report.location,
    severity: report.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    status: report.status as 'PENDING' | 'VERIFIED' | 'REJECTED',
    coordinates: { 
      lat: report.coordinates.latitude, 
      lng: report.coordinates.longitude 
    },
    reporter: report.authorName,
    timestamp: formatTimeAgo(report.createdAt),
    description: report.description
  };
  
  console.log('Created marker:', marker);
  
  // Validate the coordinates are in the expected range for India
  const lat = marker.coordinates.lat;
  const lng = marker.coordinates.lng;
  
  if (lat < 6 || lat > 37 || lng < 68 || lng > 97) {
    console.warn(`Marker coordinates (${lat}, ${lng}) seem to be outside India's bounds:`, marker.title);
  } else {
    console.log(`Marker coordinates (${lat}, ${lng}) are within India's bounds:`, marker.title);
  }
  
  return marker;
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

export function LiveMap() {
  const { t } = useTranslation();
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [popupMarker, setPopupMarker] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reports on component mount and set up auto-refresh
  useEffect(() => {
    fetchReports();
    
    // Auto-refresh every 2 minutes to show new reports
    const interval = setInterval(() => {
      fetchReports();
    }, 120000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchReports = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add cache busting parameter
      const params = {
        limit: 100, // Get more reports for the map
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      if (forceRefresh) {
        params.t = Date.now(); // Add timestamp to bust cache
      }
      
      const response = await reportsAPI.getReports(params);
      
      if (response.success) {
        const newReports = response.data || [];
        const reportsWithCoords = newReports.filter((r: any) => r.coordinates);
        
        console.log('Fetched reports:', newReports);
        console.log('Reports with coordinates:', reportsWithCoords);
        
        // Check if there are new reports
        const newReportCount = newReports.length - reports.length;
        if (newReportCount > 0 && reports.length > 0) {
          toast.success(`${newReportCount} new report(s) added to the map!`);
        }
        
        setReports(newReports);
      } else {
        setError(response.message || 'Failed to fetch reports');
        toast.error('Failed to fetch reports for map');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports');
      toast.error('Error loading map data');
    } finally {
      setLoading(false);
    }
  };

  // Convert reports to markers and filter
  const reportsWithCoordinates = reports.filter(report => report.coordinates);
  console.log('Reports with coordinates:', reportsWithCoordinates);
  
  const mapMarkers = reportsWithCoordinates
    .map(convertReportToMarker)
    .filter(marker => marker !== null); // Filter out null markers
  
  // Use real markers from the database
  const finalMarkers = mapMarkers;
  
  console.log('Converted markers:', mapMarkers);
  console.log('Final markers to display:', finalMarkers);

  const filteredMarkers = finalMarkers.filter(marker => {
    const matchesSeverity = filterSeverity === 'all' || marker.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || marker.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      marker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      marker.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSeverity && matchesStatus && matchesSearch;
  });
  
  console.log('Filtered markers:', filteredMarkers);

  const handleMarkerClick = (marker: any) => {
    // Calculate position for the popup (center of screen for now)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    setPopupMarker(marker);
    setPopupPosition({ x: centerX, y: centerY });
    setShowPopup(true);
    setSelectedMarker(marker.id);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupMarker(null);
    setPopupPosition(undefined);
    setSelectedMarker(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Interactive Hazard Map
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Real-time hazard reports and hotspot analysis
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => fetchReports(true)} 
            variant="outline" 
            size="sm"
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Force Refresh
          </Button>
          
          {/* Debug Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Reports: {reports.length} | With Coords: {finalMarkers.length} | Markers: {filteredMarkers.length}</div>
            {finalMarkers.length > 0 && (
              <div className="text-xs text-blue-600">
                Latest: {finalMarkers[0]?.title} at ({finalMarkers[0]?.coordinates.lat.toFixed(4)}, {finalMarkers[0]?.coordinates.lng.toFixed(4)})
              </div>
            )}
          </div>
          
          {/* Legend */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm">Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm">Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search reports or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('map.filterBySeverity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('map.allSeverities')}</SelectItem>
              <SelectItem value="CRITICAL">{t('reports.critical')}</SelectItem>
              <SelectItem value="HIGH">{t('reports.high')}</SelectItem>
              <SelectItem value="MEDIUM">{t('reports.medium')}</SelectItem>
              <SelectItem value="LOW">{t('reports.low')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('map.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('map.allStatuses')}</SelectItem>
              <SelectItem value="VERIFIED">{t('reports.verified')}</SelectItem>
              <SelectItem value="PENDING">{t('reports.pending')}</SelectItem>
              <SelectItem value="REJECTED">{t('reports.rejected')}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Layers className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Map and Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-[600px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading map data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-[600px]">
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    <Button 
                      onClick={fetchReports} 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              ) : finalMarkers.length === 0 ? (
                <div className="flex items-center justify-center h-[600px]">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {reports.length === 0 ? 'No Reports Found' : 'No Reports with Location Data'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {reports.length === 0 
                        ? 'No reports have been submitted yet.' 
                        : 'Reports need GPS coordinates to appear on the map. Create a report with location data to see it here.'
                      }
                      <br />
                      <span className="text-xs text-gray-500">
                        Debug: {reports.length} total reports, {reportsWithCoordinates.length} with coordinates
                      </span>
                    </p>
                    <Button 
                      onClick={fetchReports} 
                      variant="outline" 
                      size="sm"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </div>
              ) : (
                /* Google Maps Integration */
              <GoogleMap 
                markers={filteredMarkers}
                onMarkerClick={handleMarkerClick}
                selectedMarker={selectedMarker}
                height="600px"
                showInfoWindow={false}
              />
              )}
            </CardContent>
          </Card>

          {/* Map Statistics */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <Card className="text-center p-3">
              <div className="text-lg font-bold text-red-600">
                {filteredMarkers.filter(m => m.severity === 'CRITICAL').length}
              </div>
              <div className="text-xs text-gray-600">Critical</div>
            </Card>
            <Card className="text-center p-3">
              <div className="text-lg font-bold text-orange-600">
                {filteredMarkers.filter(m => m.severity === 'HIGH').length}
              </div>
              <div className="text-xs text-gray-600">High</div>
            </Card>
            <Card className="text-center p-3">
              <div className="text-lg font-bold text-yellow-600">
                {filteredMarkers.filter(m => m.severity === 'MEDIUM').length}
              </div>
              <div className="text-xs text-gray-600">Medium</div>
            </Card>
            <Card className="text-center p-3">
              <div className="text-lg font-bold text-blue-600">
                {filteredMarkers.filter(m => m.severity === 'LOW').length}
              </div>
              <div className="text-xs text-gray-600">Low</div>
            </Card>
          </div>
        </div>

        {/* Recent Reports Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Reports</span>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredMarkers.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {finalMarkers.length === 0 
                      ? 'No reports with location data available'
                      : 'No reports match your current filters'
                    }
                  </p>
                </div>
              ) : (
                filteredMarkers.map((marker) => (
                <div 
                  key={marker.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedMarker === marker.id 
                      ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => setSelectedMarker(selectedMarker === marker.id ? null : marker.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{marker.reporter.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{marker.reporter}</p>
                        <p className="text-xs text-gray-500">{marker.timestamp}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${getSeverityColor(marker.severity)} text-white border-0 text-xs`}>
                      {marker.severity}
                    </Badge>
                  </div>
                  
                  <h4 className="font-medium text-sm mb-1">{marker.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{marker.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{marker.location}</span>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(marker.status)}>
                      {marker.status === 'VERIFIED' && <CheckCircle className="w-2 h-2 mr-1" />}
                      {marker.status === 'PENDING' && <AlertTriangle className="w-2 h-2 mr-1" />}
                      {marker.status}
                    </Badge>
                  </div>
                </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Marker Popup */}
      <MarkerPopup
        marker={popupMarker}
        isOpen={showPopup}
        onClose={handleClosePopup}
        position={popupPosition}
      />
    </div>
  );
}