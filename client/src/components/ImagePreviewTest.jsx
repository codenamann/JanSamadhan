import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImagePreview from '@/components/ui/ImagePreview';

const ImagePreviewTest = () => {
  const [testFile, setTestFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setTestFile(file);
    }
  };

  const handleRemove = () => {
    setTestFile(null);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Image Preview Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          
          {testFile && (
            <div>
              <h3 className="text-lg font-medium mb-2">Test Image Preview:</h3>
              <ImagePreview
                file={testFile}
                onRemove={handleRemove}
                showControls={true}
                previewSize="medium"
              />
            </div>
          )}
          
          {!testFile && (
            <div className="text-center text-muted-foreground">
              <p>Select an image file to test the preview component</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImagePreviewTest;
