import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoImage from "@/assets/JanSamadhan.png"
import { mockIssues } from "@/data/mockData";
import CivicMap from "@/components/Map/CivicMap";
import IssueCard from "@/components/Issues/IssueCard";

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
} from "lucide-react";
import Logo from "@/components/ui/logo";

const PublicMap = () => {
  const [issues] = useState(mockIssues);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIssueCard, setShowIssueCard] = useState(false);
  const [hoveredIssue, setHoveredIssue] = useState(null);
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

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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

  return (
    <div className={`min-h-screen bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header - Only show when not in fullscreen */}
      {!isFullscreen && (
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between py-4 px-4 md:px-6">
            <div className="flex items-center space-x-3">
              <Logo link={LogoImage} alt="JanSamadhan" className='w-40' />
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex" onClick={()=>navigate('/citizen/dashboard')}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className={`relative ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-80px)]'}`}>
        {/* Fullscreen Toggle Button */}
        <div className="absolute top-4 right-4 z-40">
          <Button
            onClick={toggleFullscreen}
            size="sm"
            variant="secondary"
            className="shadow-lg bg-white/90 hover:bg-white text-black border border-gray-200 z-50"
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <img src="" alt="logo" />
            )}
          </Button>
        </div>

        {/* Issue Count Badge */}
        <div className="absolute top-4 left-4 z-30">
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
            selectedIssue={selectedIssue}
            className="h-full w-full"
          />
        </div>

        {/* Issue Card Overlay - Mobile */}
        {showIssueCard && selectedIssue && (
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-background/95 backdrop-blur-sm border-t sm:hidden">
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
              />
            </div>
          </div>
        )}

        {/* Issue Card Overlay - Desktop */}
        {hoveredIssue && !isFullscreen && (
          <div className="absolute top-20 right-4 z-20 w-80 hidden sm:block">
            <Card className="shadow-lg">
              <CardContent className="p-0">
                <IssueCard
                  issue={hoveredIssue}
                  userRole="citizen"
                  className="border-0 shadow-none"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Issue Card Overlay - Desktop Fullscreen */}
        {hoveredIssue && isFullscreen && (
          <div className="absolute top-20 right-4 z-20 w-80">
            <Card className="shadow-lg bg-background/95 backdrop-blur-sm">
              <CardContent className="p-0">
                <IssueCard
                  issue={hoveredIssue}
                  userRole="citizen"
                  className="border-0 shadow-none"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicMap;
