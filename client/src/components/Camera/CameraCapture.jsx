import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, RotateCcw, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { createImagePreview, cleanupBlobURLs } from '@/lib/cloudinary';

const CameraCapture = ({ onCapture, onClose, isOpen }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // Back camera by default

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Camera access denied. Please allow camera permissions.');
      onClose();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Video or canvas ref not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    console.log('📸 Capturing photo...');
    console.log('📐 Video dimensions:', video.videoWidth, 'x', video.videoHeight);

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    console.log('🎨 Canvas drawn, converting to blob...');

    try {
      // Convert to blob
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 0.8);
      });

      console.log('✅ Blob created:', blob.size, 'bytes');
      
      // Create file from blob
      const file = new File([blob], `captured-${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      // Create image preview with multiple formats
      const preview = await createImagePreview(file, {
        useBase64: true,
        useBlobURL: true,
        uploadToCloud: false // Don't auto-upload, let user decide
      });

      if (preview.error) {
        throw new Error(preview.error);
      }

      setCapturedFile(file);
      setCapturedImage(preview.blobURL || preview.base64);
      toast.success('Photo captured successfully!');
    } catch (error) {
      console.error('❌ Failed to capture photo:', error);
      toast.error('Failed to capture photo');
    }
  };

  const retakePhoto = () => {
    // Clean up previous image
    if (capturedImage) {
      cleanupBlobURLs(capturedImage);
    }
    setCapturedImage(null);
    setCapturedFile(null);
    
    // Restart camera to ensure it's available
    if (isOpen) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  };

  const confirmPhoto = () => {
    if (capturedFile) {
      // Pass both file and preview data
      onCapture({
        file: capturedFile,
        preview: capturedImage,
        base64: capturedImage?.startsWith('data:') ? capturedImage : null
      });
      
      // Clean up blob URL
      if (capturedImage) {
        cleanupBlobURLs(capturedImage);
      }
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);
    
    stopCamera();
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    await startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="w-full h-full max-w-md mx-auto relative">
        {/* Camera View */}
        {!capturedImage ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Camera Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                
                <Button
                  onClick={capturePhoto}
                  disabled={!isStreaming}
                  className="w-16 h-16 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-50"
                >
                  <Camera className="h-8 w-8" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={switchCamera}
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Image Preview */
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
            
            {/* Preview Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retakePhoto}
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                
                <Button
                  onClick={confirmPhoto}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Use Photo
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraCapture;
