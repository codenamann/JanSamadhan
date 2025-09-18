import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Eye, User, Phone, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useComplaint } from '@/context/ComplaintContext';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default markers in react-leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icons
const createCustomIcon = (color, status) => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">
        ${status === 'new' ? '!' : status === 'in-progress' ? '⏳' : '✓'}
      </div>
    </div>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(iconHtml)}`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
};

const ComplaintPopup = ({ complaint, userRole, onAssign, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'text-orange-500';
      case 'in-progress': return 'text-amber-500';
      case 'resolved': return 'text-green-500';
      case 'critical': return 'text-red-500';
      default: return 'text-charcoal-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-80 max-w-sm">
      <Card className="shadow-card border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-charcoal-700">
              {complaint.type}
            </CardTitle>
            <div className={`flex items-center gap-1 ${getStatusColor(complaint.status)}`}>
              {getStatusIcon(complaint.status)}
              <span className="text-sm font-medium capitalize">
                {complaint.status.replace('-', ' ')}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4">
          {/* Photo Preview */}
          {complaint.photo && (
            <div className="relative">
              <img 
                src={complaint.photo} 
                alt="Complaint" 
                className="w-full h-32 object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
          
          {/* User Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <User className="w-4 h-4" />
              <span>{complaint.userDetails?.name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <Phone className="w-4 h-4" />
              <span>{complaint.userDetails?.mobile || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(complaint.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* Location */}
          <div className="text-xs text-charcoal-500 bg-beige-100 p-2 rounded-lg">
            <div>Lat: {complaint.location?.lat?.toFixed(6)}</div>
            <div>Lng: {complaint.location?.lng?.toFixed(6)}</div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(complaint)}
              className="flex-1"
            >
              View Details
            </Button>
            
            {userRole === 'authority' && complaint.status === 'new' && (
              <Button 
                size="sm" 
                onClick={() => onAssign(complaint)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Assign
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const LiveMap = ({ userRole, onComplaintSelect, onAssignComplaint }) => {
  const { complaints, addComplaint, updateComplaint } = useComplaint();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [mapCenter, setMapCenter] = useState([23.835, 80.394]); // Default center (India)
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const getMarkerIcon = (complaint) => {
    const status = complaint.status;
    let color;
    
    switch (status) {
      case 'new':
        color = '#F97316'; // Orange
        break;
      case 'in-progress':
        color = '#F59E0B'; // Amber
        break;
      case 'resolved':
        color = '#10B981'; // Green
        break;
      case 'critical':
        color = '#EF4444'; // Red
        break;
      default:
        color = '#6B7280'; // Gray
    }
    
    return createCustomIcon(color, status);
  };

  const handleMarkerClick = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const handleAssign = (complaint) => {
    if (onAssignComplaint) {
      onAssignComplaint(complaint);
    }
    setSelectedComplaint(null);
  };

  const handleViewDetails = (complaint) => {
    if (onComplaintSelect) {
      onComplaintSelect(complaint);
    }
    setSelectedComplaint(null);
  };

  const handleMapClick = (latlng) => {
    // For future: allow adding complaints by clicking on map
    console.log('Map clicked at:', latlng);
  };

  return (
    <div className="w-full h-full relative">
      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="rounded-2xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents onMapClick={handleMapClick} />
        
        {/* User Location Marker */}
        {userLocation && (
          <Marker 
            position={userLocation} 
            icon={new Icon({
              iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                  <circle cx="10" cy="10" r="3" fill="white"/>
                </svg>
              `),
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="text-center">
                <div className="font-medium text-blue-600">Your Location</div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Complaint Markers */}
        {complaints.map((complaint) => (
          <Marker
            key={complaint.id}
            position={[complaint.location.lat, complaint.location.lng]}
            icon={getMarkerIcon(complaint)}
            eventHandlers={{
              click: () => handleMarkerClick(complaint)
            }}
          >
            <Popup>
              <ComplaintPopup
                complaint={complaint}
                userRole={userRole}
                onAssign={handleAssign}
                onViewDetails={handleViewDetails}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Card className="shadow-card p-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-charcoal-600">New</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-charcoal-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-charcoal-600">Resolved</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-charcoal-600">Critical</span>
          </div>
        </Card>
      </div>
      
      {/* Selected Complaint Overlay */}
      <AnimatePresence>
        {selectedComplaint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 z-[1000]"
          >
            <ComplaintPopup
              complaint={selectedComplaint}
              userRole={userRole}
              onAssign={handleAssign}
              onViewDetails={handleViewDetails}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveMap;
