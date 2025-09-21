# Environment Variables Setup Guide

## 📋 Required Environment Variables

Create a `.env` file in your `server` directory with the following variables:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/jansamadhan

# JWT Secret (Change this in production!)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Server Configuration
PORT=5000

# Brevo Email Service Configuration
BREVO_API_KEY=your_brevo_api_key_here
BREVO_FROM_EMAIL=noreply@jansamadhan.com

# CORS Configuration (comma-separated URLs)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 🎨 Client Environment Variables

Create a `.env` file in your `client` directory with the following variables:

```env
# Server URL
VITE_SERVER_URL=http://localhost:5000
```

## 🔧 Brevo Email Service Setup

### Step 1: Create Brevo Account
1. Go to [https://www.brevo.com/](https://www.brevo.com/)
2. Click "Sign up for free"
3. Create your account and verify your email

### Step 2: Get API Key
1. Log into your Brevo dashboard
2. Navigate to **Settings** → **API Keys**
3. Click **"Create a new API key"**
4. Give it a name (e.g., "JanSamadhan API")
5. Select **"Send emails"** permission
6. Copy the generated API key
7. Paste it in your `.env` file as `BREVO_API_KEY`

### Step 3: Set Up Sender Email
1. In Brevo dashboard, go to **Settings** → **Senders & IP**
2. Click **"Add a sender"**
3. Enter your email address (e.g., `noreply@jansamadhan.com`)
4. Verify your email by clicking the verification link sent to your inbox
5. Once verified, use this email in your `.env` file as `BREVO_FROM_EMAIL`

### Step 4: Test Email Sending
1. Start your server: `npm start`
2. Go to `/superadmin` and add an authority
3. Go to `/authority/login` and enter the authority email
4. Check your server console for the OTP code
5. If Brevo is configured correctly, you'll also receive an email

## 🗄️ Database Setup

### MongoDB Installation
1. **Windows**: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. **macOS**: `brew install mongodb-community`
3. **Linux**: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

### Start MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
mongod --dbpath /usr/local/var/mongodb
```

## 🚀 Quick Start

1. **Clone and install dependencies**:
   ```bash
   # Server
   cd server
   npm install
   
   # Client
   cd ../client
   npm install
   ```

2. **Set up environment variables**:
   - Copy the `.env` template above
   - Fill in your actual values
   - Save as `server/.env`

3. **Start the application**:
   ```bash
   # Terminal 1 - Server
   cd server
   npm start
   
   # Terminal 2 - Client
   cd client
   npm run dev
   ```

4. **Test the flow**:
   - Visit `http://localhost:5173/superadmin`
   - Add an authority account
   - Visit `http://localhost:5173/authority/login`
   - Test the OTP flow

## 🔍 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED ::1:27017
```
**Solution**: Make sure MongoDB is running on your system

**2. Brevo API Error**
```
Error: Invalid API key
```
**Solution**: Check your `BREVO_API_KEY` in the `.env` file

**3. Email Not Sending**
```
Error: Sender email not verified
```
**Solution**: Verify your sender email in Brevo dashboard

**4. CORS Error**
```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution**: Add your client URL to `CORS_ORIGINS` in `.env`

### Testing OTP Flow

1. **Check Server Console**: OTP codes are logged to console for testing
2. **Check Email**: If Brevo is configured, OTP will be sent via email
3. **Test Authority Login**: Use any registered authority email

## 📧 Email Templates

The system includes beautiful HTML email templates for:
- **OTP Verification**: Professional OTP email with JanSamadhan branding
- **Welcome Email**: Welcome message for new authority registrations

## 🔐 Security Notes

- **JWT Secret**: Use a strong, random secret in production
- **API Keys**: Keep your Brevo API key secure
- **CORS**: Only allow trusted origins in production
- **MongoDB**: Use authentication in production

## 📱 Development vs Production

### Development
- Use local MongoDB instance
- Use Brevo free tier (300 emails/day)
- Allow localhost origins in CORS

### Production
- Use MongoDB Atlas or dedicated server
- Use Brevo paid plan for higher limits
- Restrict CORS to your domain only
- Use environment-specific secrets
