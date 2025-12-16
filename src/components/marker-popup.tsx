import React from 'react';
import { X, MapPin, User, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

/**
 * MarkerPopup Component
 * 
 * A custom popup that displays detailed information about a disaster report marker
 * when clicked on the map. This provides a more detailed and styled view compared
 * to the default Google Maps InfoWindow.
 * 
 * Features:
 * - Displays report title, location, description, and metadata
 * - Shows severity and status with appropriate color coding
 * - Includes reporter information and timestamp
 * - Displays exact coordinates
 * - Responsive design with proper styling
 * - Can be positioned absolutely or centered on screen
 */

interface DisasterMarker {
  id: number;
  title: string;
  location: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  coordinates: { lat: number; lng: number };
  reporter: string;
  timestamp: string;
  description: string;
}

interface MarkerPopupProps {
  marker: DisasterMarker | null;
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

const severityColors = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-red-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-green-500',
};

const statusColors = {
  VERIFIED: 'text-green-600 bg-green-50 dark:bg-green-950/20',
  PENDING: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20',
  REJECTED: 'text-red-600 bg-red-50 dark:bg-red-950/20',
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
    case 'HIGH':
      return <AlertTriangle className="w-3 h-3" />;
    case 'MEDIUM':
      return <AlertTriangle className="w-3 h-3" />;
    case 'LOW':
      return <CheckCircle className="w-3 h-3" />;
    default:
      return <AlertTriangle className="w-3 h-3" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'VERIFIED':
      return <CheckCircle className="w-3 h-3" />;
    case 'PENDING':
      return <Clock className="w-3 h-3" />;
    case 'REJECTED':
      return <XCircle className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
};

export function MarkerPopup({ marker, isOpen, onClose, position }: MarkerPopupProps) {
  if (!isOpen || !marker) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle Escape key press
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  return (
    <div 
      className="fixed inset-0 z-50"
      onClick={handleBackdropClick}
    >
      <Card 
        className="absolute w-72 bg-white dark:bg-gray-800 shadow-2xl border-0 rounded-xl pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-200 ring-1 ring-gray-200 dark:ring-gray-700"
        style={position ? { 
          left: Math.min(position.x, window.innerWidth - 320), 
          top: Math.min(position.y, window.innerHeight - 200),
          transform: 'translate(-50%, -100%)'
        } : {
          right: '20px',
          top: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full ${severityColors[marker.severity]}`}></div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                {marker.title}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            {/* Location */}
            <div className="flex items-center space-x-1.5 text-xs text-gray-600 dark:text-gray-400">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{marker.location}</span>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
              {marker.description}
            </p>

            {/* Reporter and Timestamp */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-400">
                <User className="w-3 h-3" />
                <span className="truncate">{marker.reporter}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-gray-500 dark:text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{marker.timestamp}</span>
              </div>
            </div>

            {/* Severity and Status */}
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={`${severityColors[marker.severity]} text-white border-0 text-xs px-2 py-0.5 h-5 flex items-center space-x-1`}
              >
                {getSeverityIcon(marker.severity)}
                <span>{marker.severity}</span>
              </Badge>
              
              <Badge 
                variant="secondary" 
                className={`${statusColors[marker.status]} text-xs px-2 py-0.5 h-5 flex items-center space-x-1`}
              >
                {getStatusIcon(marker.status)}
                <span>{marker.status}</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
