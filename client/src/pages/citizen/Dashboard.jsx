import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockIssues } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, 
  Plus, 
  User, 
  Bell, 
  Menu, 
  X,
  Map,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Phone,
  Home,
  ChevronRight,
  Filter,
  Search,
  LogOut
} from 'lucide-react';
import LogoImage from '@/assets/JanSamadhan.png';
import Logo from '@/components/ui/logo';
import { useCitizenAuth } from '@/context/CitizenAuthContext';

const CitizenDashboard = () => {
  const { user, logout, loading } = useCitizenAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state if no user data
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">Please log in again to access your dashboard.</p>
          <Button onClick={logout}>Go to Login</Button>
        </div>
      </div>
    );
  }
  
  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'Issue Status Update',
      message: 'Your report "Large Pothole on Main Street" has been assigned to Mike Rodriguez',
      time: '2 hours ago',
      read: false,
      type: 'status_update'
    },
    {
      id: 2,
      title: 'New Response',
      message: 'The authority has added a comment to your report',
      time: '1 day ago',
      read: true,
      type: 'comment'
    },
    {
      id: 3,
      title: 'Issue Resolved',
      message: 'Your report "Broken Streetlight" has been marked as resolved',
      time: '3 days ago',
      read: true,
      type: 'resolved'
    }
  ];

  // Filter issues created by this user (mock data)
  const userIssues = user?.email ? mockIssues.filter(issue => issue.reportedBy?.email === user.email) : [];
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-critical" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-critical text-critical-foreground';
      case 'in-progress':
        return 'bg-warning text-warning-foreground';
      case 'resolved':
        return 'bg-success text-success-foreground';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const stats = {
    totalReports: userIssues.length,
    openReports: userIssues.filter(i => i.status === 'open').length,
    inProgressReports: userIssues.filter(i => i.status === 'in-progress').length,
    resolvedReports: userIssues.filter(i => i.status === 'resolved').length,
    closedReports: userIssues.filter(i => i.status === 'closed').length,
  };

  const Sidebar = () => (
    <div className="h-full bg-background border-r border-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <Logo link={LogoImage} alt="JanSamadhan" className="w-32" />
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User Profile */}
        <div className="mb-6 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">{user?.name || 'User'}</h3>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{user?.phone || 'No phone number'}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('overview')}
          >
            <Home className="h-4 w-4 mr-3" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'reports' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('reports')}
          >
            <FileText className="h-4 w-4 mr-3" />
            My Reports ({stats.totalReports})
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link to="/PublicMap">
              <Map className="h-4 w-4 mr-3" />
              View Map
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link to="/citizen/report">
              <Plus className="h-4 w-4 mr-3" />
              Report Issue
            </Link>
          </Button>
        </nav>

        <Separator className="my-6" />

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h4>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                {notifications.filter(n => !n.read).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  const NotificationPanel = () => (
    <div className="fixed bg-background lg:relative inset-y-0 right-0 z-50 w-80 border-l border-border transform transition-transform duration-500 ease-in-out lg:translate-x-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotificationsOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-full">
        <div className="p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium mb-2">No notifications</h4>
              <p className="text-sm text-muted-foreground">
                You're all caught up!
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                  !notification.read ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h2>
              <p className="text-muted-foreground">Here's what's happening with your reports</p>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <Button asChild>
                <Link to="/citizen/report">
                  <Plus className="h-4 w-4 mr-2" />
                  Report New Issue
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/PublicMap">
                  <Map className="h-4 w-4 mr-2" />
                  View Map
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalReports}</p>
                <p className="text-xs text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-critical" />
              <div>
                <p className="text-2xl font-bold">{stats.openReports}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{stats.inProgressReports}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{stats.resolvedReports}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {userIssues.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No reports yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by reporting an issue in your community
              </p>
              <Button asChild>
                <Link to="/citizen/report">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Your First Issue
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userIssues
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(issue.status)}
                      <div>
                        <h4 className="font-medium">{issue.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(issue.createdAt)} • {issue.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status.replace('-', ' ')}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const ReportsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Reports</h2>
          <p className="text-muted-foreground">Track the status of your reported issues</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Reports List */}
      {userIssues.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-6">
              You haven't reported any issues yet. Start by reporting a problem in your community.
            </p>
            <Button asChild>
              <Link to="/citizen/report">
                <Plus className="h-4 w-4 mr-2" />
                Report Your First Issue
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {userIssues
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((issue) => (
              <Card key={issue.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getStatusIcon(issue.status)}
                        <h3 className="text-lg font-semibold">{issue.title}</h3>
                        <Badge className={getStatusColor(issue.status)}>
                          {issue.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {issue.description}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Reported {formatDate(issue.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{issue.location.address}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span className="capitalize">{issue.category}</span>
                        </div>
                      </div>
                    </div>
                    
                    {issue.images.length > 0 && (
                      <div className="ml-4">
                        <img
                          src={issue.images[0]}
                          alt={issue.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  
                  {issue.assignedTo && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Assigned to <strong>{issue.assignedTo.name}</strong> ({issue.assignedTo.department})
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#f5efe6]/70 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Logo link={LogoImage} alt="JanSamadhan" className="w-32" />
          <div className="w-10" /> {/* Spacer */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="h-4 w-4 mr-2" />
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
        </div>
      </div>

      <div className="flex h-screen lg:h-[calc(100vh-0px)]">
        {/* Sidebar */}
        <div className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Sidebar />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Notification Panel Overlay for Mobile */}
          {notificationsOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setNotificationsOpen(false)}
            />
          )}
          {/* Desktop Header */}
          <div className="hidden lg:block bg-card border-b border-border">
            <div className="flex items-center justify-between p-6">
              <div>
                <h1 className="text-2xl font-bold">Citizen Dashboard</h1>
                <p className="text-muted-foreground">Track your community reports</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  {notifications.filter(n => !n.read).length > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {notifications.filter(n => !n.read).length}
                    </Badge>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-4 lg:p-6">
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'reports' && <ReportsTab />}
            </div>
          </ScrollArea>
        </div>

        {/* Notification Panel */}
        {notificationsOpen && (
          <div className={`fixed lg:relative inset-y-0 right-0 z-50 w-80 bg-card border-l border-border transform transition-transform duration-200 ease-in-out ${
            notificationsOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <NotificationPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;


