import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Twilio client
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} else {
  console.warn('Twilio credentials not found. SMS functionality will be limited to console logging.');
}

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send SMS
export const sendSMS = async (phoneNumber, message) => {
  try {
    console.log(`Sending SMS to: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    
    // If Twilio is not configured, just log the SMS
    if (!twilioClient) {
      console.log('Twilio not configured. SMS logged to console only.');
      return {
        success: true,
        message: "SMS logged to console (Twilio not configured)",
        consoleOnly: true
      };
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: SMS not sent, only logged to console.');
      return {
        success: true,
        message: "SMS logged to console (development mode)",
        consoleOnly: true
      };
    }
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phoneNumber}`
    });
    console.log(phoneNumber)

    console.log(`SMS sent successfully. SID: ${result.sid}`);
    return {
      success: true,
      message: "SMS sent successfully",
      sid: result.sid
    };

  } catch (error) {
    console.error('Error sending SMS:', error.message);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

// Send OTP via SMS
export const sendOTPSMS = async (phoneNumber, otp, name = 'User') => {
  const message = `Your JanSamadhan OTP is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
  return await sendSMS(phoneNumber, message);
};

// Send complaint status update SMS
export const sendComplaintStatusSMS = async (phoneNumber, complaintId, status, citizenName) => {
  const statusMessages = {
    'Pending': 'is pending review',
    'In Progress': 'is now being processed',
    'Resolved': 'has been resolved'
  };
  
  const message = `Hello ${citizenName}, your complaint #${complaintId} ${statusMessages[status] || 'status has been updated'}. Thank you for using JanSamadhan.`;
  return await sendSMS(phoneNumber, message);
};

// Send complaint resolution SMS
export const sendComplaintResolutionSMS = async (phoneNumber, complaintId, citizenName) => {
  const message = `Hello ${citizenName}, your complaint #${complaintId} has been resolved! Please check the JanSamadhan app for details. Thank you for your patience.`;
  return await sendSMS(phoneNumber, message);
};

// Send priority alert SMS
export const sendPriorityAlertSMS = async (phoneNumber, complaintId, priority, citizenName) => {
  const message = `URGENT: Hello ${citizenName}, your ${priority} priority complaint #${complaintId} requires immediate attention. Please check the JanSamadhan app.`;
  return await sendSMS(phoneNumber, message);
};

// Test SMS sending
export const testSMS = async (phoneNumber, testMessage = 'Test message from JanSamadhan') => {
  return await sendSMS(phoneNumber, testMessage);
};
