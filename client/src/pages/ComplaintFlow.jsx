import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, User, Phone, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useComplaint } from '@/context/ComplaintContext';

const ComplaintFlow = ({ onComplete }) => {
  const { complaintFlow, updateComplaintFlow, setComplaintStep, emitComplaint, resetComplaintFlow } = useComplaint();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const complaintTypes = [
    'Road & Infrastructure',
    'Water & Sanitation', 
    'Waste Management',
    'Public Safety',
    'Street Lighting',
    'Traffic Issues',
    'Environmental',
    'Other'
  ];

  const steps = [
    {
      id: 0,
      title: 'Camera Permission',
      description: 'Allow camera access to take a photo of the issue',
      icon: Camera
    },
    {
      id: 1,
      title: 'Take Photo',
      description: 'Capture a clear photo of the problem',
      icon: Camera
    },
    {
      id: 2,
      title: 'Location Permission',
      description: 'Allow location access to share precise coordinates',
      icon: MapPin
    },
    {
      id: 3,
      title: 'Complaint Type',
      description: 'Select the category of your complaint',
      icon: CheckCircle
    },
    {
      id: 4,
      title: 'Your Details',
      description: 'Provide your name and mobile number',
      icon: User
    }
  ];

  const handleCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      updateComplaintFlow({ cameraPermission: true });
      setComplaintStep(1);
    } catch (err) {
      setError('Camera permission denied. Please allow camera access to continue.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      updateComplaintFlow({ photo: photoData });
      
      // Stop camera stream
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      
      setComplaintStep(2);
    }
  };

  const handleLocationPermission = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
      
      updateComplaintFlow({ location });
      setComplaintStep(3);
    } catch (err) {
      setError('Location permission denied. Please allow location access to continue.');
    }
  };

  const handleTypeSelect = (type) => {
    updateComplaintFlow({ type });
    setComplaintStep(4);
  };

  const handleUserDetailsSubmit = () => {
    if (!complaintFlow.userDetails.name || !complaintFlow.userDetails.mobile) {
      setError('Please fill in all required fields');
      return;
    }
    
    setComplaintStep(5);
  };

  const handleSubmitComplaint = async () => {
    setLoading(true);
    setError('');
    
    try {
      const complaint = {
        id: Date.now().toString(),
        type: complaintFlow.type,
        photo: complaintFlow.photo,
        location: complaintFlow.location,
        userDetails: complaintFlow.userDetails,
        status: 'new',
        priority: 'medium',
        timestamp: new Date().toISOString(),
        assignedTo: null
      };
      
      // Emit through socket
      emitComplaint(complaint);
      
      // Reset flow
      resetComplaintFlow();
      
      // Call completion callback
      onComplete(complaint);
      
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (complaintFlow.step > 0) {
      setComplaintStep(complaintFlow.step - 1);
    }
  };

  const renderStepContent = () => {
    switch (complaintFlow.step) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto">
              <Camera className="w-10 h-10 text-orange-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-charcoal-700 mb-2">
                Camera Access Required
              </h3>
              <p className="text-charcoal-500">
                We need camera permission to capture a photo of the issue you're reporting.
              </p>
            </div>
            <Button 
              onClick={handleCameraPermission}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Allow Camera Access
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-charcoal-700 mb-2">
                Take a Photo
              </h3>
              <p className="text-charcoal-500">
                Position the camera to capture the issue clearly
              </p>
            </div>
            
            <div className="relative bg-charcoal-100 rounded-2xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={goBack}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={capturePhoto}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture Photo
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto">
              <MapPin className="w-10 h-10 text-orange-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-charcoal-700 mb-2">
                Location Access Required
              </h3>
              <p className="text-charcoal-500">
                We need your precise location to mark the issue on the map.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={goBack}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleLocationPermission}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Share Location
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-charcoal-700 mb-2">
                Select Complaint Type
              </h3>
              <p className="text-charcoal-500">
                Choose the category that best describes your issue
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {complaintTypes.map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  onClick={() => handleTypeSelect(type)}
                  className="h-auto p-4 text-left justify-start hover:bg-orange-50 hover:border-orange-200"
                >
                  <div>
                    <div className="font-medium text-sm">{type}</div>
                  </div>
                </Button>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              onClick={goBack}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-charcoal-700 mb-2">
                Your Details
              </h3>
              <p className="text-charcoal-500">
                Provide your contact information for updates
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Full Name *
                </label>
                <Input
                  placeholder="Enter your full name"
                  value={complaintFlow.userDetails.name}
                  onChange={(e) => updateComplaintFlow({ 
                    userDetails: { ...complaintFlow.userDetails, name: e.target.value }
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Mobile Number *
                </label>
                <Input
                  placeholder="Enter your mobile number"
                  type="tel"
                  value={complaintFlow.userDetails.mobile}
                  onChange={(e) => updateComplaintFlow({ 
                    userDetails: { ...complaintFlow.userDetails, mobile: e.target.value }
                  })}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={goBack}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleUserDetailsSubmit}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-charcoal-700 mb-2">
                Review & Submit
              </h3>
              <p className="text-charcoal-500">
                Please review your complaint details before submitting
              </p>
            </div>
            
            <div className="bg-beige-100 rounded-2xl p-4 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-charcoal-600">Type:</span>
                <span className="font-medium">{complaintFlow.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-600">Name:</span>
                <span className="font-medium">{complaintFlow.userDetails.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-600">Mobile:</span>
                <span className="font-medium">{complaintFlow.userDetails.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-600">Location:</span>
                <span className="font-medium text-xs">
                  {complaintFlow.location?.lat?.toFixed(6)}, {complaintFlow.location?.lng?.toFixed(6)}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={goBack}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleSubmitComplaint}
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-beige-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-700 text-center mb-2">
            Report an Issue
          </h1>
          <p className="text-charcoal-500 text-center">
            Step {complaintFlow.step + 1} of {steps.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= complaintFlow.step 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-charcoal-200 text-charcoal-500'
                }`}>
                  {index < complaintFlow.step ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs text-charcoal-500 mt-1 hidden sm:block">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-charcoal-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((complaintFlow.step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-card">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={complaintFlow.step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center"
          >
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ComplaintFlow;
