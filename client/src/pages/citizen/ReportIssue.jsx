import React, { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Camera, 
  ArrowLeft, 
  Send,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import CameraCapture from '@/components/Camera/CameraCapture';
import ImagePreview from '@/components/ui/ImagePreview';
import { useLocation } from '@/hooks/useLocation';
import { useCitizenAuth } from '@/context/CitizenAuthContext';
import { uploadImage } from '@/lib/apiImages';
import { name } from '@cloudinary/url-gen/actions/namedTransformation';
import axios from 'axios';

const ReportIssue = () => {
  const navigate = useNavigate();
  const { user } = useCitizenAuth();
  const { location, loading: locationLoading, getCurrentLocation, clearLocation } = useLocation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const value = useCitizenAuth();
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    location: null,
    image: null,
    imageFile: null,
    reporterName: user?.name || '',
    reporterEmail: user?.email || ''
  });

  const steps = [
    { id: 1, title: 'Permissions', description: 'Camera & Location' },
    { id: 2, title: 'Photo', description: 'Capture Issue' },
    { id: 3, title: 'Details', description: 'Describe Issue' },
    { id: 4, title: 'Submit', description: 'Review & Send' }
  ];

  // Auto-request permissions and location on mount
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        console.log('Starting permission request...');
        // Request location permission first
        await getCurrentLocation();
        setPermissionsGranted(true);
        setCurrentStep(2); // Move to camera step
        setShowCamera(true);
        console.log('Permissions granted, moving to camera step');
      } catch (error) {
        console.error('Permission request failed:', error);
        toast.error('Please allow location access to continue');
        setCurrentStep(1);
      }
    };

    requestPermissions();
  }, []);

  // Update form with location when available
  useEffect(() => {
    if (location) {
      setForm(prev => ({ ...prev, location }));
    }
  }, [location]);

  const handleCameraCapture = (imageData) => {
    console.log('Image captured:', imageData);
    setCapturedImage(imageData.preview);
    setCapturedFile(imageData.file);
    setForm(prev => ({ ...prev, image: imageData.preview, imageFile: imageData.file }));
    setShowCamera(false);
    setCurrentStep(3);
    toast.success('Photo captured successfully!');
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    setForm(prev => ({ ...prev, image: null, imageFile: null }));
    setShowCamera(true);
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission started with data:', form);
    console.log('Captured image:', capturedImage);
    console.log('Location data:', form.location);
    
    if (!form.title || !form.description || !form.category) {
      console.log('Missing required fields');
      toast.error('Please fill in all required fields');
      return;
    }

    if (!form.location) {
      console.log('Missing location');
      toast.error('Location is required');
      return;
    }

    if (!form.image) {
      console.log('Missing image');
      toast.error('Photo is required');
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting form...');

    try {
      let finalImageUrl = form.image;
      
      // If we have a file but no cloud URL, upload it first
      if (capturedFile && !uploadedImageUrl) {
        console.log('Uploading image to Cloudinary...');
        toast.loading('Uploading image...', { id: 'image-upload' });
        
        const uploadResult = await uploadImage(capturedFile);
        
        if (uploadResult.success) {
          finalImageUrl = uploadResult.data.url;
          console.log('Image uploaded successfully:', finalImageUrl);
          toast.success('Image uploaded successfully!', { id: 'image-upload' });
        } else {
          throw new Error(uploadResult.error || 'Image upload failed');
        }
      }
      
      // Prepare issue data
      const issueData = {
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
        location: form.location,
        image: finalImageUrl,
        reportedBy: {
          name: value.name,
          email: form.reporterEmail
        },
        createdAt: new Date().toISOString()
      };
      
      console.log('Final issue data:', issueData);
      
      // Send to backend API
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL }/api/complaints`,{
          ...issueData,
          reportedBy: {
            id : user?.id,
            name: user?.name,
            phone: user?.phone,
          },
          image: finalImageUrl,
          cloudinaryPublicId: finalImageUrl ? finalImageUrl.split('/').pop().split('.')[0] : null
        });
      console.log('Server response:', response.data);
      if (!response.data?.success) {
        console.log('Complaint submission failed:', response.error);
        throw new Error(response.error || 'Failed to submit complaint');
      }

      const issueId = response.data._id;
      
      console.log('Issue submitted successfully with ID:', issueId);
      
      toast.success('Issue reported successfully!', {
        description: `Your report has been submitted with ID #${issueId}`
      });
      
      // Clean up captured image
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
        console.log('Cleaned up captured image');
      }
      
      // Navigate back to dashboard
      navigate('/citizen/dashboard', { replace: true });
    } catch (error) {
      console.error('Form submission failed:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Clean up captured image
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    clearLocation();
    navigate('/citizen/dashboard', { replace: true });
  };

  const isFormValid = form.title && form.description && form.category && form.location && form.image;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/90 border-b border-border sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <div>
                <h1 className="text-xl font-bold">Report an Issue</h1>
                <p className="text-sm text-muted-foreground">Step {currentStep} of 4</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              {steps.map((step) => (
                <span 
                  key={step.id}
                  className={`${currentStep >= step.id ? 'text-primary' : ''}`}
                >
                  {step.title}
                </span>
              ))}
            </div>
            <Progress value={(currentStep / steps.length) * 100} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Step 1: Permissions */}
        {currentStep === 1 && (
          <Card>
            <CardContent className="p-6 text-center space-y-6">
              <div className="space-y-2">
                <AlertTriangle className="h-12 w-12 text-primary mx-auto" />
                <h2 className="text-2xl font-bold">Permissions Required</h2>
                <p className="text-muted-foreground">
                  We need access to your camera and location to report this issue effectively.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <Camera className="h-6 w-6 text-primary" />
                  <div className="text-left">
                    <h3 className="font-medium">Camera Access</h3>
                    <p className="text-sm text-muted-foreground">To capture a photo of the issue</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                  <div className="text-left">
                    <h3 className="font-medium">Location Access</h3>
                    <p className="text-sm text-muted-foreground">To automatically get your current location</p>
                  </div>
                </div>
              </div>

              {locationLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Getting your location...</span>
                </div>
              ) : (
                <Button 
                  onClick={async () => {
                    try {
                      await getCurrentLocation();
                      setPermissionsGranted(true);
                      setCurrentStep(2);
                      setShowCamera(true);
                    } catch (error) {
                      toast.error('Please allow location access to continue');
                    }
                  }}
                  className="w-full"
                >
                  Grant Permissions
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Camera */}
        {currentStep === 2 && !showCamera && (
          <Card>
            <CardContent className="p-6 text-center space-y-6">
              <div className="space-y-2">
                <Camera className="h-12 w-12 text-primary mx-auto" />
                <h2 className="text-2xl font-bold">Capture Photo</h2>
                <p className="text-muted-foreground">
                  Take a clear photo of the issue you want to report.
                </p>
              </div>

               {capturedFile && (
                 <div className="space-y-4">
                   <div className="text-center">
                     <p className="text-sm text-muted-foreground mb-2">Captured Image Preview:</p>
                     <ImagePreview
                       file={capturedFile}
                       onRetake={retakePhoto}
                       onConfirm={() => setCurrentStep(3)}
                       showControls={true}
                       previewSize="medium"
                       className="mx-auto"
                     />
                   </div>
                 </div>
               )}

              {!capturedFile && (
                <Button onClick={() => setShowCamera(true)} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Open Camera
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Form Details */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Issue Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(4); }} className="space-y-6">
                 {/* Photo Preview */}
                 {capturedFile && (
                   <div className="space-y-2">
                     <Label>Captured Photo</Label>
                     <ImagePreview
                       file={capturedFile}
                       onRetake={retakePhoto}
                       onRemove={retakePhoto}
                       showControls={true}
                       previewSize="medium"
                     />
                     
                     {/* Image will be automatically uploaded on form submission */}
                     <div className="text-sm text-muted-foreground">
                       <p>Image will be automatically uploaded when you submit the form</p>
                     </div>
                   </div>
                 )}

                {/* Location Display */}
                {form.location && (
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{form.location.address}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Coordinates: {form.location.lat}, {form.location.lng}
                        {form.location.accuracy && ` (Accuracy: ${Math.round(form.location.accuracy)}m)`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Issue Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    placeholder="Briefly describe the issue..."
                    value={form.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={form.category} onValueChange={(value) => handleFormChange('category', value)}>
                    <SelectTrigger className='bg-background'>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Sanitation">Sanitation</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Environment">Environment</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about the issue..."
                    className="min-h-24"
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    required
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!form.title || !form.description || !form.category}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Review & Submit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               {/* Photo Preview */}
               {capturedFile && (
                 <div className="space-y-2">
                   <Label>Photo</Label>
                   <ImagePreview
                     file={capturedFile}
                     showControls={false}
                     previewSize="medium"
                   />
                   <div className="text-sm text-muted-foreground">
                     <p>📸 Image will be automatically uploaded to cloud storage</p>
                   </div>
                 </div>
               )}

              {/* Issue Details */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                  <p className="text-lg">{form.title}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p className="capitalize">{form.category}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-muted-foreground">{form.description}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{form.location?.address}</span>
                    </div>
                    <div className="text-xs text-muted-foreground ml-6">
                      Coordinates: {form.location?.lat}, {form.location?.lng}
                      {form.location?.accuracy && ` (Accuracy: ${Math.round(form.location.accuracy)}m)`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(3)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Camera Modal */}
      <CameraCapture
        isOpen={showCamera}
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    </div>
  );
};

export default ReportIssue;