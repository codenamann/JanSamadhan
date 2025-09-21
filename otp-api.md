# OTP & SMS API Configuration Guide

## 📱 SMS Service Setup

This application supports multiple SMS providers for sending OTPs and notifications. Choose one based on your needs:

### 1. Twilio (Recommended)

**Pros**: Reliable, global coverage, easy integration
**Cons**: Paid service (but has free trial)

#### Setup Steps:
1. Go to [https://www.twilio.com/](https://www.twilio.com/)
2. Sign up for a free account
3. Get your credentials from the Twilio Console

#### Environment Variables:
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 2. TextLocal (India-focused)

**Pros**: Good for Indian numbers, competitive pricing
**Cons**: Limited global coverage

#### Setup Steps:
1. Go to [https://www.textlocal.in/](https://www.textlocal.in/)
2. Create an account and verify your phone
3. Get your API key from the dashboard

#### Environment Variables:
```env
# TextLocal Configuration
TEXTLOCAL_API_KEY=your_textlocal_api_key_here
TEXTLOC_SENDER_ID=TXTLCL
```

### 3. AWS SNS (Amazon)

**Pros**: Scalable, reliable, pay-per-use
**Cons**: More complex setup

#### Setup Steps:
1. Go to [https://aws.amazon.com/sns/](https://aws.amazon.com/sns/)
2. Create an AWS account
3. Set up SNS service
4. Create IAM user with SNS permissions

#### Environment Variables:
```env
# AWS SNS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
```

## 🔧 Complete Environment Variables

Add these to your `server/.env` file:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/jansamadhan

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000

# Email Service (Brevo)
BREVO_API_KEY=your_brevo_api_key_here
BREVO_FROM_EMAIL=noreply@jansamadhan.com

# SMS Service (Choose ONE)
# Option 1: Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Option 2: TextLocal
# TEXTLOCAL_API_KEY=your_textlocal_api_key_here
# TEXTLOCAL_SENDER_ID=TXTLCL

# Option 3: AWS SNS
# AWS_ACCESS_KEY_ID=your_aws_access_key_here
# AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
# AWS_REGION=us-east-1

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📱 SMS Service Features

### What Gets Sent via SMS:
1. **OTP Verification**: When citizens/authorities login
2. **Complaint Status Updates**: When authority changes complaint status
3. **Resolution Notifications**: When complaint is marked as resolved
4. **Priority Alerts**: For high-priority complaints

### SMS Templates:
- **OTP**: "Your JanSamadhan OTP is: {otp}. Valid for 10 minutes."
- **Status Update**: "Your complaint #{id} status has been updated to: {status}"
- **Resolution**: "Your complaint #{id} has been resolved. Please verify the resolution."

## 🧪 Testing SMS Services

### Test with Twilio:
```bash
# Test SMS sending
curl -X POST http://localhost:5000/api/test/sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "message": "Test message"}'
```

### Console Logging:
- All SMS attempts are logged to console
- OTP codes are always logged for development
- Failed SMS attempts show error details

## 💰 Cost Considerations

### Twilio:
- **Free Trial**: $15 credit (good for testing)
- **Pay-as-you-go**: ~$0.0075 per SMS
- **Monthly**: $1/month for phone number

### TextLocal:
- **Free**: 10 SMS per day
- **Paid**: Starting from ₹0.15 per SMS
- **Bulk**: Better rates for high volume

### AWS SNS:
- **Free Tier**: 100 SMS per month
- **Pay-as-you-go**: ~$0.0075 per SMS
- **No monthly fees**

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit API keys to code
2. **Rate Limiting**: Implement SMS rate limiting
3. **OTP Expiry**: Set reasonable OTP expiry times (10 minutes)
4. **Phone Validation**: Validate phone numbers before sending
5. **Error Handling**: Don't expose sensitive error details

## 🚀 Quick Start

1. **Choose a provider** (Twilio recommended for beginners)
2. **Set up account** and get credentials
3. **Add environment variables** to `server/.env`
4. **Restart server** to load new variables
5. **Test SMS** using the test endpoint

## 📞 Support

- **Twilio**: [https://support.twilio.com/](https://support.twilio.com/)
- **TextLocal**: [https://www.textlocal.in/support/](https://www.textlocal.in/support/)
- **AWS SNS**: [https://docs.aws.amazon.com/sns/](https://docs.aws.amazon.com/sns/)

## 🔄 Switching Providers

To switch SMS providers:
1. Update environment variables
2. Restart server
3. No code changes needed (automatic detection)

The system automatically detects which provider is configured and uses it accordingly.
