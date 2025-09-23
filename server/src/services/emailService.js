import * as brevo from '@getbrevo/brevo';
import dotenv from "dotenv";
dotenv.config();

const apiInstance = new brevo.TransactionalEmailsApi();
if (!process.env.BREVO_API_KEY) {
  console.log('BREVO_API_KEY not found in environment variables.');
}else{
  
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, name) => {
  try {
    console.log(`Sending OTP email to: ${email}`);
    console.log(`OTP Code: ${otp}`);
    
    // If Brevo is not configured, just log the OTP
    if (!apiInstance) {
      console.log('Brevo not configured. OTP logged to console only.');
      return {
        success: true,
        message: "OTP logged to console (Brevo not configured)",
        consoleOnly: true
      };
    }
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = "Jan Samadhan - OTP Verification";
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Jan Samadhan</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Authority Portal Access</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">OTP Verification</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hello ${name || 'Authority Member'},
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You have requested to access the Jan Samadhan Authority Portal. Please use the following OTP to complete your login:
          </p>
          
          <div style="background: #fff; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 5px; font-family: 'Courier New', monospace;">${otp}</h1>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated message from Jan Samadhan Authority Portal.
            </p>
          </div>
        </div>
      </div>
    `;
    
    sendSmtpEmail.sender = {
      name: "Jan Samadhan",
      email: process.env.BREVO_FROM_EMAIL || "noreply@jansamadhan.com"
    };
    
    sendSmtpEmail.to = [{
      email: email,
      name: name || "Authority Member"
    }];
    
    if(process.env.NODE_ENV === 'development'){
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`OTP email sent successfully to ${email}`);
      console.log(`Brevo Response:`, result);
      return {
        success: true,
        messageId: result.messageId,
        message: "OTP sent successfully"
      };
    }
    console.log('Development mode - OTP email not sent via Brevo.');
    return {
      success: true,
      message: "OTP sent successfully"
    };
    
  } catch (error) {
    console.error(`Error sending OTP email to ${email}:`, error);
    return {
      success: false,
      error: error.message || "Failed to send OTP email"
    };
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, name, department) => {
  try {
    console.log(`Sending welcome email to: ${email}`);
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = "Welcome to Jan Samadhan Authority Portal";
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Jan Samadhan</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Authority Portal</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Welcome to Jan Samadhan!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hello ${name},
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Welcome to the Jan Samadhan Authority Portal! You have been successfully registered as an authority member from the <strong>${department}</strong> department.
          </p>
          
          <div style="background: #e8f4fd; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h3 style="color: #333; margin-top: 0;">What you can do:</h3>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>View and manage citizen complaints</li>
              <li>Update complaint status and priority</li>
              <li>Assign complaints to team members</li>
              <li>Track resolution progress</li>
              <li>Generate reports and analytics</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You can now log in to the portal using your registered email address. If you have any questions or need assistance, please contact the system administrator.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated message from Jan Samadhan Authority Portal.
            </p>
          </div>
        </div>
      </div>
    `;
    
    sendSmtpEmail.sender = {
      name: "Jan Samadhan",
      email: process.env.BREVO_FROM_EMAIL || "noreply@jansamadhan.com"
    };
    
    sendSmtpEmail.to = [{
      email: email,
      name: name
    }];
    
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Welcome email sent successfully to ${email}`);
    
    return {
      success: true,
      messageId: result.messageId,
      message: "Welcome email sent successfully"
    };
    
  } catch (error) {
    console.error(`Error sending welcome email to ${email}:`, error);
    return {
      success: false,
      error: error.message || "Failed to send welcome email"
    };
  }
};
