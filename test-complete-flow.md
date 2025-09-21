# Complete Authority Authentication Flow Test

## 🧪 Testing Steps

### 1. Environment Setup
1. Create `server/.env` with the variables from `env.md`
2. Create `client/.env` with `VITE_SERVER_URL=http://localhost:5000`
3. Start MongoDB: `mongod` (or `brew services start mongodb-community` on macOS)

### 2. Start the Application
```bash
# Terminal 1 - Server
cd server
npm start

# Terminal 2 - Client  
cd client
npm run dev
```

### 3. Test Super Admin Panel
1. Visit `http://localhost:5173/superadmin`
2. Add a new authority:
   - Name: "Test Authority"
   - Email: "test@authority.com"
   - Department: "Public Works"
   - Designation: "Engineer"
   - Phone: "+91-9876543210"
3. Click "Add Authority"
4. Verify the authority appears in the list

### 4. Test Authority Login Flow
1. Visit `http://localhost:5173/authority/login`
2. Enter email: "test@authority.com"
3. Click "Send OTP"
4. Check server console for OTP code (e.g., "🔐 OTP Code: 123456")
5. Enter the 6-digit OTP
6. Click "Verify OTP"
7. Should redirect to authority dashboard

### 5. Test Authority Dashboard
1. Should see "Test Authority - Public Works" in header
2. Should see logout button
3. Should see dashboard content

### 6. Test OTP Email (if Brevo configured)
1. Check email inbox for OTP email
2. Email should have JanSamadhan branding
3. Should contain the same OTP as console

## 🔍 Expected Console Output

### Server Console
```
✅ MongoDB Connected: localhost
🚀 Server running on port 5000
📧 Sending OTP email to: test@authority.com
🔐 OTP Code: 123456
✅ Authority login successful: test@authority.com
```

### Client Console
```
✅ Socket.io connected
✅ Authority registered successfully
✅ Login successful!
```

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED ::1:27017
```
**Solution**: Start MongoDB service

**2. CORS Error**
```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution**: Check CORS_ORIGINS in server/.env

**3. API Connection Error**
```
Failed to fetch
```
**Solution**: Check VITE_SERVER_URL in client/.env

**4. OTP Not Working**
```
Invalid OTP. Please try again
```
**Solution**: Check server console for correct OTP code

## ✅ Success Indicators

- [ ] Super admin panel loads without errors
- [ ] Can add new authority successfully
- [ ] Authority appears in the list
- [ ] Authority login page loads
- [ ] OTP is generated and logged to console
- [ ] OTP verification works
- [ ] Authority dashboard loads with user info
- [ ] Logout functionality works

## 🎯 Next Steps

Once the basic flow is working:
1. Configure Brevo for actual email sending
2. Test with real email addresses
3. Add more authority accounts
4. Test complaint management features
5. Customize authority dashboard
