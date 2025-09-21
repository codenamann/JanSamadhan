import React, { useState, useEffect } from 'react';
import { useAuthorityAuth } from '../../context/AuthorityAuthContext';
import { useSocket } from '../../context/SocketContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import LogoImage from '@/assets/JanSamadhan.png';
import { 
  LogOut, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Bell,
  BarChart3,
  Map,
  List,
  RefreshCw,
  Download,
  ArrowLeft,
  Shield,
  PhoneCall,
  Mail as MailIcon,
  User as UserIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllComplaints, getComplaintStats } from '../../lib/apiCitizen';
import { toast } from '../../hooks/use-toast';
import Logo from '@/components/ui/logo';

const Dashboard = () => {
  const { user, logout, loading } = useAuthorityAuth();
  const { socket, isConnected } = useSocket();
  
  // State management
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Fetch complaints and stats
  const fetchData = async () => {
    try {
      setDataLoading(true);
      const [complaintsData, statsData] = await Promise.all([
        getAllComplaints(),
        getComplaintStats()
      ]);
      
      if (complaintsData.success) {
        setComplaints(complaintsData.data);
      }
      
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch complaints data",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (socket && isConnected) {
      socket.on('complaint-updated', (data) => {
        setComplaints(prev => 
          prev.map(complaint => 
            complaint._id === data.data._id ? data.data : complaint
          )
        );
        fetchData(); // Refresh stats
      });

      socket.on('new-complaint', (data) => {
        setComplaints(prev => [data.data, ...prev]);
        fetchData(); // Refresh stats
      });

      return () => {
        socket.off('complaint-updated');
        socket.off('new-complaint');
      };
    }
  }, [socket, isConnected]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Handle status update
  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/api/complaints/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Complaint status updated to ${newStatus}`,
        });
        fetchData();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update complaint status",
        variant: "destructive"
      });
    }
  };

  // Handle complaint resolution
  const handleResolveComplaint = async () => {
    if (!selectedComplaint || !resolutionText.trim()) return;

    try {
      setIsResolving(true);
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/api/complaints/${selectedComplaint._id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          resolution: resolutionText,
          otp: '123456' // For now, using dummy OTP
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Complaint resolved successfully! Citizen will be notified.",
        });
        setIsDetailOpen(false);
        setResolutionText('');
        setSelectedComplaint(null);
        fetchData();
      } else {
        throw new Error('Failed to resolve complaint');
      }
    } catch (error) {
      console.error('Error resolving complaint:', error);
      toast({
        title: "Error",
        description: "Failed to resolve complaint",
        variant: "destructive"
      });
    } finally {
      setIsResolving(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state
  if (dataLoading) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/90 border-b border-border sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
              <Logo link={LogoImage} alt="JanSamadhan" className="w-32" />
                {/* <h1 className="text-xl font-bold">Authority Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage and track civic complaints</p> */}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>{user.name} - {user.department}</span>
              </div>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" asChild>
                <Link to="/PublicMap">
                  <Map className="h-4 w-4 mr-2" />
                  View Map
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComplaints}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.pendingComplaints}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgressComplaints}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedComplaints}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card>
          <CardHeader>
            <CardTitle>Complaints ({filteredComplaints.length})</CardTitle>
            <CardDescription>
              Manage and track all civic complaints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.map((complaint) => (
                  <TableRow key={complaint._id}>
                    <TableCell className="font-medium">
                      <div className="max-w-[200px] truncate">
                        {complaint.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">{complaint.reportedBy?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />
                          <span>{complaint.reportedBy?.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{complaint.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(complaint.priority)}>
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(complaint.status)}>
                        {complaint.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {complaint.status !== 'Resolved' && (
                          <Select
                            value={complaint.status}
                            onValueChange={(value) => handleStatusUpdate(complaint._id, value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredComplaints.length === 0 && (
              <div className="text-center py-8">
                <List className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No complaints found</h3>
                <p className="text-muted-foreground">
                  No complaints match your current filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Complaint Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>
              View and manage complaint details
            </DialogDescription>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-sm">{selectedComplaint.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-sm">{selectedComplaint.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <Badge className={getPriorityColor(selectedComplaint.priority)}>
                    {selectedComplaint.priority}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge className={getStatusColor(selectedComplaint.status)}>
                    {selectedComplaint.status}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm mt-1">{selectedComplaint.description}</p>
              </div>

              {/* Reporter Info */}
              <div>
                <label className="text-sm font-medium text-gray-500">Reporter Information</label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{selectedComplaint.reportedBy?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{selectedComplaint.reportedBy?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    Lat: {selectedComplaint.location?.lat?.toFixed(4) || 'N/A'}, 
                    Lng: {selectedComplaint.location?.lon?.toFixed(4) || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Image */}
              {selectedComplaint.image && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Image</label>
                  <div className="mt-2">
                    <img 
                      src={selectedComplaint.image} 
                      alt="Complaint" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Resolution Form */}
              {selectedComplaint.status !== 'Resolved' && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Resolution</label>
                  <Textarea
                    placeholder="Enter resolution details..."
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            {selectedComplaint?.status !== 'Resolved' && (
              <Button 
                onClick={handleResolveComplaint}
                disabled={!resolutionText.trim() || isResolving}
              >
                {isResolving ? 'Resolving...' : 'Resolve Complaint'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
       