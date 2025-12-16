import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

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

interface GoogleMapProps {
  markers: DisasterMarker[];
  onMarkerClick?: (marker: DisasterMarker) => void;
  selectedMarker?: number | null;
  height?: string;
  showInfoWindow?: boolean;
}

const severityColors = {
  CRITICAL: '#ef4444', // red-500
  HIGH: '#ef4444',     // red-500
  MEDIUM: '#eab308',   // yellow-500
  LOW: '#22c55e',      // green-500
};

const statusColors = {
  VERIFIED: '#10b981', // emerald-500
  PENDING: '#f59e0b',  // amber-500
  REJECTED: '#ef4444', // red-500
};

export function GoogleMap({ markers, onMarkerClick, selectedMarker, height = '600px', showInfoWindow = true }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindows, setInfoWindows] = useState<google.maps.InfoWindow[]>([]);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        await loader.load();
        setGoogleMapsLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (googleMapsLoaded && mapRef.current && !map) {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // Center on India
        zoom: 5,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [{ color: '#1e293b' }] // slate-800
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#0f172a' }] // slate-900
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#334155' }] // slate-700
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#94a3b8' }] // slate-400
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#1e293b' }] // slate-800
          },
          {
            featureType: 'poi',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#94a3b8' }] // slate-400
          },
          {
            featureType: 'transit',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#1e293b' }] // slate-800
          },
          {
            featureType: 'road',
            elementType: 'geometry.fill',
            stylers: [{ color: '#475569' }] // slate-600
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#cbd5e1' }] // slate-300
          },
          {
            featureType: 'road',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#1e293b' }] // slate-800
          },
          {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#475569' }] // slate-600
          },
          {
            featureType: 'administrative',
            elementType: 'geometry.fill',
            stylers: [{ color: '#334155' }] // slate-700
          },
          {
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#cbd5e1' }] // slate-300
          },
          {
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#1e293b' }] // slate-800
          }
        ]
      });

      setMap(mapInstance);
    }
  }, [googleMapsLoaded, map]);

  useEffect(() => {
    console.log('GoogleMap useEffect triggered:', { map: !!map, markersCount: markers.length });
    console.log('Markers data:', markers);
    
    if (map && markers.length > 0) {
      // Clear existing markers and info windows
      mapMarkers.forEach(marker => marker.setMap(null));
      infoWindows.forEach(infoWindow => infoWindow.close());
      
      const newMarkers: google.maps.Marker[] = [];
      const newInfoWindows: google.maps.InfoWindow[] = [];

      markers.forEach((markerData) => {
        console.log('Processing marker:', {
          title: markerData.title,
          location: markerData.location,
          coordinates: markerData.coordinates,
          severity: markerData.severity
        });
        const marker = new google.maps.Marker({
          position: markerData.coordinates,
          map: map,
          title: markerData.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: selectedMarker === markerData.id ? 12 : 8,
            fillColor: severityColors[markerData.severity],
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          animation: selectedMarker === markerData.id ? google.maps.Animation.BOUNCE : undefined,
          zIndex: selectedMarker === markerData.id ? 1000 : 1,
        });
        
        console.log('Created Google Maps marker:', marker, 'at position:', markerData.coordinates);

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="
              padding: 16px; 
              max-width: 300px; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.4;
            ">
              <div style="
                display: flex; 
                align-items: center; 
                gap: 8px; 
                margin-bottom: 12px;
              ">
                <div style="
                  width: 12px; 
                  height: 12px; 
                  border-radius: 50%; 
                  background-color: ${severityColors[markerData.severity]};
                "></div>
                <span style="
                  font-weight: 600; 
                  color: #1f2937; 
                  font-size: 14px;
                ">${markerData.title}</span>
              </div>
              
              <p style="
                font-size: 13px; 
                color: #6b7280; 
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 4px;
              ">
                📍 ${markerData.location}
              </p>
              
              <p style="
                font-size: 12px; 
                color: #9ca3af; 
                margin-bottom: 12px;
                line-height: 1.3;
              ">${markerData.description}</p>
              
              <div style="
                display: flex; 
                align-items: center; 
                justify-content: space-between; 
                font-size: 11px;
                margin-bottom: 8px;
              ">
                <span style="
                  display: flex; 
                  align-items: center; 
                  gap: 4px;
                  color: #6b7280;
                ">
                  👤 ${markerData.reporter}
                </span>
                <span style="color: #9ca3af;">${markerData.timestamp}</span>
              </div>
              
              <div style="
                display: flex; 
                align-items: center; 
                gap: 8px;
              ">
                <span style="
                  padding: 4px 8px; 
                  border-radius: 4px; 
                  font-size: 10px; 
                  font-weight: 500;
                  background-color: ${severityColors[markerData.severity]}20; 
                  color: ${severityColors[markerData.severity]};
                ">
                  ${markerData.severity}
                </span>
                <span style="
                  padding: 4px 8px; 
                  border-radius: 4px; 
                  font-size: 10px; 
                  font-weight: 500;
                  background-color: ${statusColors[markerData.status]}20; 
                  color: ${statusColors[markerData.status]};
                ">
                  ${markerData.status}
                </span>
              </div>
            </div>
          `,
        });

        marker.addListener('click', () => {
          // Close all other info windows
          newInfoWindows.forEach(iw => iw.close());
          
          // Open this info window if enabled
          if (showInfoWindow) {
            infoWindow.open(map, marker);
          }
          
          // Call the onMarkerClick callback if provided
          if (onMarkerClick) {
            onMarkerClick(markerData);
          }
        });

        newMarkers.push(marker);
        newInfoWindows.push(infoWindow);
      });

      setMapMarkers(newMarkers);
      setInfoWindows(newInfoWindows);

      // Fit map to show all markers
      if (markers.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(markerData => {
          bounds.extend(markerData.coordinates);
        });
        console.log('Setting map bounds for multiple markers:', bounds.toString());
        map.fitBounds(bounds);
      } else if (markers.length === 1) {
        console.log('Setting map center for single marker:', markers[0].coordinates);
        map.setCenter(markers[0].coordinates);
        map.setZoom(10);
      }
    }
  }, [map, markers, selectedMarker, onMarkerClick]);

  if (!googleMapsLoaded) {
    return (
      <div 
        className="flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full rounded-lg overflow-hidden shadow-lg"
        style={{ height }}
      />
      
      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-sky-50/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Hazard Severity</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Critical</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-gray-700 dark:text-gray-300">High</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Medium</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
