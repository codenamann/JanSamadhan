import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Camera, Clock, CheckCircle, AlertCircle, Eye, Phone, User, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useComplaint } from '@/context/ComplaintContext';
import LiveMap from '@/components/LiveMap';

const CitizenDashboard = ({ onNewComplaint, onBack }) => {
  const { complaints, userInfo } = useComplaint();
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Filter complaints by current user (in real app, this would be by user ID)
  const userComplaints = complaints.filter(c => 
    c.userDetails?.mobile === userInfo.mobile || 
    c.userDetails?.name === userInfo.name
  );

  const newComplaints = userComplaints.filter(c => c.status === 'new');
  const inProgressComplaints = userComplaints.filter(c => c.status === 'in-progress');
  const resolvedComplaints = userComplaints.filter(c => c.status === 'resolved');

  const handleComplaintSelect = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'text-orange-500 bg-orange-50';
      case 'in-progress': return 'text-amber-500 bg-amber-50';
      case 'resolved': return 'text-green-500 bg-green-50';
      case 'critical': return 'text-red-500 bg-red-50';
      default: return 'text-charcoal-500 bg-charcoal-50';
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

  const getStatusMessage = (status) => {
    switch (status) {
      case 'new': return 'Your complaint has been received and is under review.';
      case 'in-progress': return 'Your complaint has been assigned and work is in progress.';
      case 'resolved': return 'Your complaint has been resolved. Please verify the solution.';
      case 'critical': return 'Your complaint has been marked as critical and will be prioritized.';
      default: return 'Status unknown.';
    }
  };

  const ComplaintCard = ({ complaint }) => (
    <Card className="hover:shadow-card transition-all duration-200 cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Photo */}
          {complaint.photo && (
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <img 
                src={complaint.photo} 
                alt="Complaint" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-charcoal-700 truncate">
                {complaint.type}
              </h4>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                {getStatusIcon(complaint.status)}
                <span className="capitalize">{complaint.status.replace('-', ' ')}</span>
              </div>
            </div>
            
            <p className="text-sm text-charcoal-600 mb-3">
              {getStatusMessage(complaint.status)}
            </p>
            
            <div className="space-y-1 text-sm text-charcoal-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>Submitted: {new Date(complaint.timestamp).toLocaleDateString()}</span>
              </div>
              {complaint.assignedTo && (
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>Assigned to: {complaint.assignedTo}</span>
                </div>
              )}
              {complaint.resolvedAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  <span>Resolved: {new Date(complaint.resolvedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleComplaintSelect(complaint)}
              className="mt-3"
            >
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-beige-50">
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-charcoal-700">
                  My Complaints
                </h1>
                <p className="text-sm text-charcoal-500">
                  Track your submitted issues
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={onBack}
                className="text-charcoal-600"
              >
                ← Back
              </Button>
              
              <Button 
                onClick={onNewComplaint}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Report New Issue
              </Button>
              
              <div className="text-right">
                <div className="text-sm font-medium text-charcoal-700">
                  {userInfo.name || 'Citizen'}
                </div>
                <div className="text-xs text-charcoal-500">
                  {userInfo.mobile || 'No mobile'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">New</p>
                  <p className="text-2xl font-bold text-orange-900">{newComplaints.length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">In Progress</p>
                  <p className="text-2xl font-bold text-amber-900">{inProgressComplaints.length}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Resolved</p>
                  <p className="text-2xl font-bold text-green-900">{resolvedComplaints.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-charcoal-50 border-charcoal-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal-700">Total</p>
                  <p className="text-2xl font-bold text-charcoal-900">{userComplaints.length}</p>
                </div>
                <MapPin className="w-8 h-8 text-charcoal-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  City Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-4rem)]">
                <LiveMap 
                  userRole="citizen"
                  onComplaintSelect={handleComplaintSelect}
                />
              </CardContent>
            </Card>
          </div>

          {/* My Complaints List */}
          <div>
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>My Complaints</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-4rem)]">
                {userComplaints.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-charcoal-700 mb-2">
                        No complaints yet
                      </h3>
                      <p className="text-charcoal-500 mb-4">
                        Report your first issue to get started
                      </p>
                      <Button 
                        onClick={onNewComplaint}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Report Issue
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Tabs defaultValue="all" className="h-full">
                    <TabsList className="grid w-full grid-cols-4 mx-4 mt-2">
                      <TabsTrigger value="all" className="text-xs">
                        All ({userComplaints.length})
                      </TabsTrigger>
                      <TabsTrigger value="new" className="text-xs">
                        New ({newComplaints.length})
                      </TabsTrigger>
                      <TabsTrigger value="progress" className="text-xs">
                        Progress ({inProgressComplaints.length})
                      </TabsTrigger>
                      <TabsTrigger value="resolved" className="text-xs">
                        Resolved ({resolvedComplaints.length})
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="h-[calc(100%-3rem)] overflow-y-auto">
                      <TabsContent value="all" className="p-4 space-y-3">
                        <AnimatePresence>
                          {userComplaints.map((complaint) => (
                            <motion.div
                              key={complaint.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                            >
                              <ComplaintCard complaint={complaint} />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </TabsContent>
                      
                      <TabsContent value="new" className="p-4 space-y-3">
                        <AnimatePresence>
                          {newComplaints.map((complaint) => (
                            <motion.div
                              key={complaint.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                            >
                              <ComplaintCard complaint={complaint} />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </TabsContent>
                      
                      <TabsContent value="progress" className="p-4 space-y-3">
                        <AnimatePresence>
                          {inProgressComplaints.map((complaint) => (
                            <motion.div
                              key={complaint.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                            >
                              <ComplaintCard complaint={complaint} />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </TabsContent>
                      
                      <TabsContent value="resolved" className="p-4 space-y-3">
                        <AnimatePresence>
                          {resolvedComplaints.map((complaint) => (
                            <motion.div
                              key={complaint.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                            >
                              <ComplaintCard complaint={complaint} />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </TabsContent>
                    </div>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
