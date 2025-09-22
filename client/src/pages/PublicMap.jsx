import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoImage from "@/assets/JanSamadhan.png"
import CivicMap from "@/components/Map/CivicMap";
import IssueCard from "@/components/Issues/IssueCard";
import { useSocket } from "@/context/SocketContext";
import { useAuthorityAuth } from "@/context/AuthorityAuthContext";
import { getAllComplaints } from "@/lib/apiCitizen";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import {
  MapPin,
  Maximize2,
  Minimize2,
  Menu,
  X,
  Settings,
  User,
  Minimize,
  Maximize,
  LayoutDashboard,
  RefreshCw,
  List,
  ChevronDown,
  ChevronUp,
  Navigation,
} from "lucide-react";
import Logo from "@/components/ui/logo";
import { useCitizenAuth } from "@/context/CitizenAuthContext";

const PublicMap = () => {
  const { socket, isConnected, joinPublicRoom } = useSocket();
  const { user: authorityUser, isAuthenticated: isAuthorityAuthenticated } = useAuthorityAuth();
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIssueCard, setShowIssueCard] = useState(false);
  const [hoveredIssue, setHoveredIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIssuesList, setShowIssuesList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const mapRef = useRef(null);
  const navigate = useNavigate();

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const { user:citizen} = useCitizenAuth();
  const { user:authority} = useAuthorityAuth();

  const redirectToDashboard = () => {
    if (citizen) {
      navigate('/citizen/dashboard');
    } else if (authority) {
      navigate('/authority/dashboard');
    } else {
      console.log("No user found, staying put.");
    }
  };
  

  // Fetch complaints data
  useEffect(() => {
    fetchComplaints();
  }, []);

  // Socket connection and event listeners
  useEffect(() => {
    if (socket && isConnected) {
      // Join public room for general updates
      joinPublicRoom();

      // Listen for new complaints
      socket.on('new-complaint', (data) => {
        setIssues(prev => [data.data, ...prev]);
        toast.success('New complaint reported!');
      });

      // Listen for complaint updates
      socket.on('complaint-updated', (data) => {
        setIssues(prev => 
          prev.map(complaint => 
            complaint._id === data.data._id ? data.data : complaint
          )
        );
      });

      return () => {
        socket.off('new-complaint');
        socket.off('complaint-updated');
      };
    }
  }, [socket, isConnected, joinPublicRoom]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      console.log('Fetching complaints...');
      const response = await getAllComplaints({ limit: 100 });
      console.log('Complaints response:', response);
      setIssues(response.data || []);
      console.log('Issues set:', response.data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  // Handle issue selection from map
  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue);
    setShowIssueCard(true);
  };

  // Handle issue hover
  const handleIssueHover = (issue) => {
    setHoveredIssue(issue);
  };

  const handleIssueLeave = () => {
    setHoveredIssue(null);
  };

  // Handle issue selection from list
  const handleIssueSelectFromList = (issue) => {
    setSelectedIssue(issue);
    setHoveredIssue(issue);
    setShowIssuesList(false);
    
    // You can add map panning logic here if needed
    // For now, the issue will be highlighted on the map
  };

  const handleAssignToAuthority = (issue) => {
    if (isAuthorityAuthenticated) {
      // Navigate to authority dashboard with the specific complaint
      navigate(`/authority/dashboard?complaint=${issue._id}`);
    } else {
      toast.error("Please log in as an authority to assign complaints");
    }
  };

  // Filter issues based on search term
  const filteredIssues = issues.filter(issue => 
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style>
        {`
          .map-container .leaflet-container {
            z-index: 1 !important;
          }
          .map-container .leaflet-tile-pane {
            z-index: 1 !important;
          }
          .map-container .leaflet-overlay-pane {
            z-index: 2 !important;
          }
          .map-container .leaflet-marker-pane {
            z-index: 3 !important;
          }
          .map-container .leaflet-popup-pane {
            z-index: 4 !important;
          }
        `}
      </style>
      <div className={`min-h-screen bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header - Only show when not in fullscreen */}
      {!isFullscreen && (
        <div className="sticky top-0 z-[9998] bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between py-4 px-4 md:px-6">
            <div className="flex items-center space-x-3">
              <Logo link={LogoImage} alt="JanSamadhan" className='w-40' />
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Button variant="outline" size="sm" className="hidden sm:flex" onClick={fetchComplaints} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex" onClick={()=> {redirectToDashboard();}}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => {
                  console.log('Issues button clicked, current state:', showIssuesList);
                  console.log('Issues data:', issues);
                  setShowIssuesList(!showIssuesList);
                }}
                className="relative bg-blue-500 hover:bg-blue-600"
              >
                <List className="h-4 w-4 mr-2" />
                <span>Issues ({issues.length})</span>
                {showIssuesList ? (
                  <ChevronUp className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 ml-1" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Issues List Panel */}
      {showIssuesList && !isFullscreen && (
        <div className="absolute  hidden sm:block top-20 right-4 z-[9999] w-80 max-h-100 bg-white border-2 border-red-500 rounded-lg shadow-xl">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Issues List</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIssuesList(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading issues...</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="p-4 text-center">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'No issues match your search' : 'No issues found'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue._id}
                    className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleIssueSelectFromList(issue)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm line-clamp-1">{issue.title}</h4>
                      <Badge 
                        className={
                          issue.status === 'Pending' ? 'bg-red-100 text-red-800 border-red-200' :
                          issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }
                      >
                        {issue.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {issue.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{issue.category}</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Issues List Panel */}
      {showIssuesList && !isFullscreen && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-background/95 backdrop-blur-sm border-t border-border max-h-96">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Issues List</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIssuesList(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading issues...</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="p-4 text-center">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'No issues match your search' : 'No issues found'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue._id}
                    className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleIssueSelectFromList(issue)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm line-clamp-1">{issue.title}</h4>
                      <Badge 
                        className={
                          issue.status === 'Pending' ? 'bg-red-100 text-red-800 border-red-200' :
                          issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }
                      >
                        {issue.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {issue.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{issue.category}</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className={`relative ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-80px)]'} map-container`}>
        {/* Fullscreen Toggle Button */}
        <div className="absolute top-4 right-4 z-[9997]">
          <Button
            onClick={toggleFullscreen}
            size="sm"
            variant="secondary"
            className="shadow-lg bg-white/90 hover:bg-white text-black border border-gray-200 z-50"
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Issue Count Badge */}
        <div className="absolute top-4 left-4 z-[9997]">
          <Badge variant="secondary" className="bg-background/95 backdrop-blur-sm">
            {issues.length} issues
          </Badge>
        </div>

        {/* Map */}
        <div ref={mapRef} className="h-full w-full">
          <CivicMap
            issues={issues}
            onIssueSelect={handleIssueSelect}
            onIssueHover={handleIssueHover}
            onIssueLeave={handleIssueLeave}
            selectedIssue={selectedIssue || hoveredIssue}
            className="h-full w-full"
          />
        </div>

        {/* Issue Card Overlay - Mobile */}
        {showIssueCard && selectedIssue && (
          <div className="absolute bottom-0 left-0 right-0 z-[9996] p-4 bg-background/95 backdrop-blur-sm border-t sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Issue Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowIssueCard(false);
                  setSelectedIssue(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              <IssueCard
                issue={selectedIssue}
                userRole="citizen"
                className="border-0 shadow-none"
                onAssignToAuthority={handleAssignToAuthority}
                showAuthorityButton={isAuthorityAuthenticated}
              />
            </div>
          </div>
        )}

        {/* Issue Card Overlay - Desktop */}
        {hoveredIssue && !isFullscreen && (
          <div className="absolute top-20 right-4 z-[9996] w-80 hidden sm:block">
            <Card className="shadow-lg">
              <CardContent className="p-0">
                <IssueCard
                  issue={hoveredIssue}
                  userRole="citizen"
                  className="border-0 shadow-none"
                  onAssignToAuthority={handleAssignToAuthority}
                  showAuthorityButton={isAuthorityAuthenticated}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Issue Card Overlay - Desktop Fullscreen */}
        {hoveredIssue && isFullscreen && (
          <div className="absolute top-20 right-4 z-[9996] w-80">
            <Card className="shadow-lg bg-background/95 backdrop-blur-sm">
              <CardContent className="p-0">
                <IssueCard
                  issue={hoveredIssue}
                  userRole="citizen"
                  className="border-0 shadow-none"
                  onAssignToAuthority={handleAssignToAuthority}
                  showAuthorityButton={isAuthorityAuthenticated}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default PublicMap;
