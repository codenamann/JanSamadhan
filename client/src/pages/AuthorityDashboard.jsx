import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, CheckCircle, Clock, AlertCircle, Eye, Phone, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useComplaint } from '@/context/ComplaintContext';
import LiveMap from '@/components/LiveMap';

const AuthorityDashboard = ({ onBack }) => {
  const { complaints, updateComplaint, userInfo, setUserInfo } = useComplaint();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [assignedComplaints, setAssignedComplaints] = useState([]);

  // Filter complaints by status
  const newComplaints = complaints.filter(c => c.status === 'new');
  const inProgressComplaints = complaints.filter(c => c.status === 'in-progress');
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');

  const handleComplaintSelect = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const handleAssign = (complaint) => {
    setSelectedComplaint(complaint);
    setShowAssignModal(true);
  };

  const confirmAssign = () => {
    if (selectedComplaint) {
      const updatedComplaint = {
        ...selectedComplaint,
        status: 'in-progress',
        assignedTo: userInfo.name || 'Current Authority',
        assignedAt: new Date().toISOString()
      };
      
      updateComplaint(updatedComplaint);
      setAssignedComplaints(prev => [...prev, updatedComplaint]);
      setShowAssignModal(false);
      setSelectedComplaint(null);
    }
  };

  const handleResolve = (complaint) => {
    setSelectedComplaint(complaint);
    setShowResolveModal(true);
  };

  const confirmResolve = () => {
    if (selectedComplaint) {
      const updatedComplaint = {
        ...selectedComplaint,
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        resolvedBy: userInfo.name || 'Current Authority'
      };
      
      updateComplaint(updatedComplaint);
      setShowResolveModal(false);
      setSelectedComplaint(null);
    }
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

  const ComplaintCard = ({ complaint, showActions = false }) => (
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
            
            <div className="space-y-1 text-sm text-charcoal-600">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span>{complaint.userDetails?.name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span>{complaint.userDetails?.mobile || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>{new Date(complaint.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
            
            {showActions && (
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleComplaintSelect(complaint)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                {complaint.status === 'new' && (
                  <Button 
                    size="sm" 
                    onClick={() => handleAssign(complaint)}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Assign
                  </Button>
                )}
                {complaint.status === 'in-progress' && (
                  <Button 
                    size="sm" 
                    onClick={() => handleResolve(complaint)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Resolve
                  </Button>
                )}
              </div>
            )}
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
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-charcoal-700">
                  Authority Dashboard
                </h1>
                <p className="text-sm text-charcoal-500">
                  Manage citizen complaints
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
              
              <div className="text-right">
                <div className="text-sm font-medium text-charcoal-700">
                  {userInfo.name || 'Authority User'}
                </div>
                <div className="text-xs text-charcoal-500">
                  {userInfo.role || 'Administrator'}
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
                  <p className="text-sm font-medium text-orange-700">New Complaints</p>
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
                  <p className="text-2xl font-bold text-charcoal-900">{complaints.length}</p>
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
                  Live Map View
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-4rem)]">
                <LiveMap 
                  userRole="authority"
                  onComplaintSelect={handleComplaintSelect}
                  onAssignComplaint={handleAssign}
                />
              </CardContent>
            </Card>
          </div>

          {/* Complaints List */}
          <div>
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Complaints</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-4rem)]">
                <Tabs defaultValue="new" className="h-full">
                  <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
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
                    <TabsContent value="new" className="p-4 space-y-3">
                      <AnimatePresence>
                        {newComplaints.map((complaint) => (
                          <motion.div
                            key={complaint.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <ComplaintCard complaint={complaint} showActions={true} />
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
                            <ComplaintCard complaint={complaint} showActions={true} />
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
                            <ComplaintCard complaint={complaint} showActions={false} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Complaint</DialogTitle>
            <DialogDescription>
              Are you sure you want to assign this complaint to yourself?
            </DialogDescription>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="bg-beige-100 p-4 rounded-xl">
                <h4 className="font-semibold text-charcoal-700 mb-2">
                  {selectedComplaint.type}
                </h4>
                <div className="text-sm text-charcoal-600 space-y-1">
                  <div>Reporter: {selectedComplaint.userDetails?.name}</div>
                  <div>Mobile: {selectedComplaint.userDetails?.mobile}</div>
                  <div>Date: {new Date(selectedComplaint.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAssign}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Assign to Me
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Modal */}
      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Complaint</DialogTitle>
            <DialogDescription>
              Mark this complaint as resolved. An OTP will be sent to the citizen for verification.
            </DialogDescription>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="bg-beige-100 p-4 rounded-xl">
                <h4 className="font-semibold text-charcoal-700 mb-2">
                  {selectedComplaint.type}
                </h4>
                <div className="text-sm text-charcoal-600 space-y-1">
                  <div>Reporter: {selectedComplaint.userDetails?.name}</div>
                  <div>Mobile: {selectedComplaint.userDetails?.mobile}</div>
                  <div>Assigned: {selectedComplaint.assignedTo}</div>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <p className="text-sm text-amber-700">
                  <strong>Note:</strong> After marking as resolved, you'll need to call the citizen 
                  and share the OTP for final verification.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmResolve}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthorityDashboard;
