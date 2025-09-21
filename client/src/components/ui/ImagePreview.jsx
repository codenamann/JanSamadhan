import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Image as ImageIcon, 
  Upload, 
  X, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { createImagePreview, cleanupBlobURLs } from '@/lib/cloudinary';
import { toast } from 'sonner';

const ImagePreview = ({ 
  file, 
  onRemove, 
  onRetake, 
  onConfirm, 
  showControls = true,
  showUploadProgress = true,
  autoUpload = false,
  className = "",
  previewSize = "medium" // small, medium, large
}) => {
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Size configurations
  const sizeConfig = {
    small: "h-24 w-32",
    medium: "h-48 w-64", 
    large: "h-64 w-80"
  };

  useEffect(() => {
    if (file) {
      loadPreview();
    }

    return () => {
      // Cleanup blob URLs when component unmounts
      if (preview?.blobURL) {
        cleanupBlobURLs(preview.blobURL);
      }
    };
  }, [file]);

  const loadPreview = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const previewData = await createImagePreview(file, {
        useBase64: true,
        useBlobURL: true,
        uploadToCloud: autoUpload
      });

      setPreview(previewData);

      if (previewData.error) {
        setError(previewData.error);
        toast.error('Failed to create image preview');
      } else {
        toast.success('Image preview loaded successfully');
      }
    } catch (err) {
      console.error('Error loading preview:', err);
      setError(err.message);
      toast.error('Failed to load image preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const previewData = await createImagePreview(file, {
        useBase64: true,
        useBlobURL: true,
        uploadToCloud: true
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (previewData.success) {
        setPreview(prev => ({ ...prev, ...previewData }));
        toast.success('Image uploaded successfully');
      } else {
        throw new Error(previewData.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      toast.error('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetake = () => {
    if (preview?.blobURL) {
      cleanupBlobURLs(preview.blobURL);
    }
    setPreview(null);
    setError(null);
    onRetake?.();
  };

  const handleConfirm = () => {
    if (preview) {
      onConfirm?.(preview);
    }
  };

  const handleRemove = () => {
    if (preview?.blobURL) {
      cleanupBlobURLs(preview.blobURL);
    }
    setPreview(null);
    setError(null);
    onRemove?.();
  };

  if (!file && !preview) {
    return (
      <Card className={`${className}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2" />
            <p>No image selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && !preview) {
    return (
      <Card className={`${className}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading preview...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load image preview: {error}
            </AlertDescription>
          </Alert>
          {showControls && (
            <div className="flex space-x-2 mt-4">
              <Button variant="outline" onClick={loadPreview} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button variant="outline" onClick={handleRemove} size="sm">
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        {/* Image Preview */}
        <div className="relative">
          <img
            src={preview?.cloudinaryURL || preview?.blobURL || preview?.base64}
            alt="Preview"
            className={`${sizeConfig[previewSize]} object-cover rounded-lg border mx-auto`}
            onLoad={() => console.log('✅ Image loaded successfully')}
            onError={(e) => {
              console.error('❌ Image failed to load:', e);
              setError('Failed to load image');
            }}
          />
          
          {/* Upload Status Badge */}
          {preview?.cloudinaryURL && (
            <Badge className="absolute top-2 right-2 bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Uploaded
            </Badge>
          )}
        </div>

        {/* Upload Progress */}
        {showUploadProgress && isLoading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* File Info */}
        {file && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p><strong>Name:</strong> {file.name}</p>
            <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>Type:</strong> {file.type}</p>
          </div>
        )}

        {/* Controls */}
        {showControls && (
          <div className="flex flex-wrap gap-2 mt-4">
            {!preview?.cloudinaryURL && autoUpload && (
              <Button 
                onClick={handleUpload} 
                disabled={isLoading}
                size="sm"
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload
              </Button>
            )}
            
            {onRetake && (
              <Button 
                variant="outline" 
                onClick={handleRetake}
                size="sm"
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
            )}
            
            {onConfirm && (
              <Button 
                onClick={handleConfirm}
                size="sm"
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            )}
            
            {onRemove && (
              <Button 
                variant="destructive" 
                onClick={handleRemove}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImagePreview;
