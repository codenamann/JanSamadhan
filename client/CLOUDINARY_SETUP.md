# Cloudinary Setup Guide

## 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com) and sign up for a free account
2. After signing up, you'll get your Cloud Name, API Key, and API Secret from the dashboard

## 2. Create Upload Preset
1. In your Cloudinary dashboard, go to Settings > Upload
2. Scroll down to "Upload presets" section
3. Click "Add upload preset"
4. Set the following:
   - Preset name: `jan-samadhan-upload`
   - Signing Mode: `Unsigned`
   - Folder: `jan-samadhan/issues`
   - Resource Type: `Image`
   - Quality: `Auto`
   - Format: `Auto`
5. Save the preset

## 3. Environment Variables
Create a `.env.local` file in the client directory with:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=jan-samadhan-upload

# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
```

## 4. Server Environment Variables
Create a `.env` file in the server directory with:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/jan-samadhan

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 5. Features Implemented

### Image Preview System
- **Base64 Support**: For immediate preview without upload
- **Blob URL Support**: For efficient memory management
- **Cloudinary Upload**: For permanent storage and optimization
- **Fallback System**: Multiple preview options ensure images always display

### Image Handling Flow
1. **Capture**: Camera captures image and creates File object
2. **Preview**: Multiple preview formats (base64, blob URL) for immediate display
3. **Upload**: Optional upload to Cloudinary for permanent storage
4. **Optimization**: Cloudinary automatically optimizes images for web delivery

### Benefits
- **Reliable Previews**: Images always display using fallback system
- **Memory Efficient**: Proper cleanup of blob URLs prevents memory leaks
- **Cloud Storage**: Images stored securely in Cloudinary
- **Optimized Delivery**: Cloudinary serves optimized images based on device/connection
- **Scalable**: Can handle large numbers of images efficiently

## 6. Usage

The system automatically handles:
- Image capture from camera
- Multiple preview formats
- Optional cloud upload
- Memory cleanup
- Error handling and fallbacks

No additional configuration needed once environment variables are set!
