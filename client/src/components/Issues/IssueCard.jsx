import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, AlertCircle, Shield } from 'lucide-react';

const IssueCard = ({ 
  issue, 
  onViewDetails, 
  onStatusChange,
  onAssignToAuthority,
  showAuthorityButton = false,
  userRole = 'citizen'
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canChangeStatus = userRole === 'authority' || userRole === 'admin';
  const canVerify = userRole === 'citizen' && issue.status === 'resolved' && 
                   issue.citizenVerification?.status === 'pending';

  return (
    <Card className="civic-card hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2">{issue.title}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(issue.status)}>
                {issue.status}
              </Badge>
              <Badge variant="secondary">
                {issue.category}
              </Badge>
              <Badge className={getPriorityColor(issue.priority)}>
                {issue.priority}
              </Badge>
            </div>
          </div>
          {issue.priority === 'critical' && (
            <AlertCircle className="h-5 w-5 text-critical flex-shrink-0 ml-2" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground leading-relaxed line-clamp-3">
          {issue.description}
        </p>

        {issue.image && (
          <img 
            src={issue.image} 
            alt={issue.title}
            className="w-full h-48 object-cover rounded-md"
          />
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">Lat: {issue.location.lat.toFixed(4)}, Lng: {issue.location.lon.toFixed(4)}</span>
          </div>
          
          {showAuthorityButton && <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Reported by {issue.reportedBy.name}</span>
          </div>}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDate(issue.createdAt)}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails?.(issue)}
          >
            View Details
          </Button>
          
          {showAuthorityButton && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onAssignToAuthority?.(issue)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Shield className="h-4 w-4 mr-1" />
              Assign
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueCard;