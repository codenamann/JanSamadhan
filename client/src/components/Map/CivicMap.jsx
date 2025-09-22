import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToString } from 'react-dom/server';
import { Badge } from '@/components/ui/badge';
import MapPin from '../ui/MapPin';

// Fix for default markers in Leaflet with Vite
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return '#dc2626'; // red
    case 'In Progress':
      return '#f59e0b'; // yellow  
    case 'Resolved':
      return '#16a34a'; // green
    default:
      return '#64748b'; // gray
  }
};

const createCustomIcon = (status) => {
  const color = getStatusColor(status);
  const htmlString = renderToString(<MapPin size={'28'} color={color} />)
  return divIcon({
    html: htmlString,
    className: 'civic-marker',
    iconSize: [1, 1],
    iconAnchor: [2, 2], 
  });
};

const CivicMap = ({ 
  issues, 
  onIssueSelect, 
  onIssueHover,
  onIssueLeave,
  selectedIssue,
  className = "h-96 w-full" 
}) => {
  // Center map on Satna district, Madhya Pradesh, India
  const center = [24.5833, 80.8333];
  const mapRef = useRef(null);
  
  // Pan to selected issue
  useEffect(() => {
    if (selectedIssue && mapRef.current) {
      const map = mapRef.current;
      map.setView([selectedIssue.location.lat, selectedIssue.location.lon], 16, {
        animate: true,
        duration: 1
      });
    }
  }, [selectedIssue]);

  return (
    <div className={className}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {issues.map((complaint) => (
          <Marker
            key={complaint._id}
            position={[complaint.location.lat, complaint.location.lon]}
            icon={createCustomIcon(complaint.status)}
            eventHandlers={{
              click: () => {
                onIssueSelect?.(complaint);
              },
              mouseover: () => {
                onIssueHover?.(complaint);
              },
              mouseout: () => {
                onIssueLeave?.();
              },
            }}
          >
            <Popup className="civic-popup">
              <div className="p-2 min-w-64">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{complaint.title}</h3>
                  <Badge 
                    variant="outline" 
                    className={`status-badge ${complaint.status.toLowerCase().replace(' ', '-')}`}
                  >
                    {complaint.status}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {complaint.description}
                </p>
                
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="font-medium">Category:</span>{' '}
                    <span className="capitalize">{complaint.category}</span>
                  </div>
                  <div>
                    <span className="font-medium">Priority:</span>{' '}
                    <span className="capitalize">{complaint.priority}</span>
                  </div>
                  <div>
                    <span className="font-medium">Reported:</span>{' '}
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {complaint.image && (
                  <img 
                    src={complaint.image} 
                    alt={complaint.title}
                    className="w-full h-20 object-cover rounded mt-2"
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CivicMap;