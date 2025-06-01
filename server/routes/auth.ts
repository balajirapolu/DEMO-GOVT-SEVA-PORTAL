import express from 'express';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { storage } from '../storage';

const router = express.Router();

// In-memory storage for OTPs (use Redis or database in production)
const otpStorage = new Map<string, {
  otp: string;
  email: string;
  expiresAt: number;
  attempts: number;
}>();

// Email transporter setup (will be configured with actual credentials)
let transporter: nodemailer.Transporter;

// Function to initialize email transporter
export function initializeEmailTransporter() {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    console.log('Email transporter initialized with Gmail SMTP');
  } catch (error) {
    console.error('Failed to initialize email transporter:', error);
    throw error;
  }
}

// Function to generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to fetch user email by Aadhaar number from database
async function getUserEmailByAadhaar(aadhaarNumber: string): Promise<string | null> {
  const user = await storage.getUserByAadhaar(aadhaarNumber);
  return user ? user.email : null;
}

// Function to send HTML email with OTP
async function sendOTPEmail(email: string, otp: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .email-container {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .header {
                background-color: #2563eb;
                color: white;
                text-align: center;
                padding: 20px;
                border-radius: 8px 8px 0 0;
            }
            .content {
                background-color: white;
                padding: 30px;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .otp-box {
                background-color: #f3f4f6;
                border: 2px dashed #2563eb;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
                border-radius: 8px;
            }
            .otp-code {
                font-size: 32px;
                font-weight: bold;
                color: #2563eb;
                letter-spacing: 8px;
                margin: 10px 0;
            }
            .warning {
                color: #dc2626;
                font-size: 14px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>🏛️ Government Portal</h1>
                <p>Secure Document Management System</p>
            </div>
            <div class="content">
                <h2>Your Login OTP</h2>
                <p>Hello,</p>
                <p>You have requested to login to the Government Portal. Please use the following OTP to complete your login:</p>
                
                <div class="otp-box">
                    <p>Your OTP Code:</p>
                    <div class="otp-code">${otp}</div>
                    <p><strong>Valid for 5 minutes</strong></p>
                </div>
                
                <p>If you didn't request this OTP, please ignore this email or contact support.</p>
                
                <div class="warning">
                    <strong>Security Notice:</strong>
                    <ul>
                        <li>Never share this OTP with anyone</li>
                        <li>Government officials will never ask for your OTP</li>
                        <li>This OTP expires in 5 minutes</li>
                    </ul>
                </div>
                
                <p>Best regards,<br>Government Portal Team</p>
            </div>
        </div>
    </body>
    </html>
  `;

  if (!transporter) {
    throw new Error('Email transporter not initialized');
  }

  const mailOptions = {
    from: `"Government Portal" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Government Portal - Login OTP',
    html: htmlContent
  };

  return transporter.sendMail(mailOptions);
}

// Input validation schemas
const sendOtpSchema = z.object({
  aadhaarNumber: z.string().length(12)
});

const verifyOtpSchema = z.object({
  aadhaarNumber: z.string().length(12),
  otp: z.string().length(6)
});

// Route 1: Send OTP
router.post('/user/send-otp', async (req, res) => {
  try {
    const { aadhaarNumber } = sendOtpSchema.parse(req.body);
    
    // Step 1: Fetch associated email ID
    const email = await getUserEmailByAadhaar(aadhaarNumber);
    if (!email) {
      return res.status(404).json({ 
        error: 'No account found with this Aadhaar number' 
      });
    }
    
    // Step 2: Generate 6-digit OTP
    const otp = generateOTP();
    
    // Step 3: Store OTP with expiration (5 minutes)
    const otpData = {
      otp,
      email,
      expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
      attempts: 0
    };
    otpStorage.set(aadhaarNumber, otpData);
    
    // Step 4: Send OTP via HTML email
    await sendOTPEmail(email, otp);
    
    console.log(`OTP sent for ${aadhaarNumber}: ${otp}`); // For debugging - remove in production
    
    res.json({
      message: 'OTP sent successfully',
      email: email
    });
    
  } catch (error) {
    console.error('Send OTP Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Please provide a valid 12-digit Aadhaar number' 
      });
    }
    res.status(500).json({ 
      error: 'Failed to send OTP. Please try again.' 
    });
  }
});

// Route 2: Verify OTP and Login
router.post('/user/verify-otp', async (req, res) => {
  try {
    const { aadhaarNumber, otp } = verifyOtpSchema.parse(req.body);
    
    // Get stored OTP data
    const storedOtpData = otpStorage.get(aadhaarNumber);
    if (!storedOtpData) {
      return res.status(400).json({ 
        error: 'No OTP found. Please request a new OTP.' 
      });
    }
    
    // Check if OTP is expired
    if (Date.now() > storedOtpData.expiresAt) {
      otpStorage.delete(aadhaarNumber);
      return res.status(400).json({ 
        error: 'OTP has expired. Please request a new OTP.' 
      });
    }
    
    // Check attempts (prevent brute force)
    if (storedOtpData.attempts >= 3) {
      otpStorage.delete(aadhaarNumber);
      return res.status(400).json({ 
        error: 'Too many invalid attempts. Please request a new OTP.' 
      });
    }
    
    // Verify OTP
    if (storedOtpData.otp !== otp) {
      storedOtpData.attempts++;
      otpStorage.set(aadhaarNumber, storedOtpData);
      return res.status(400).json({ 
        error: `Invalid OTP. ${3 - storedOtpData.attempts} attempts remaining.` 
      });
    }
    
    // OTP is correct - grant access
    otpStorage.delete(aadhaarNumber); // Remove used OTP
    
    // Fetch actual user from database
    const user = await storage.getUserByAadhaar(aadhaarNumber);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Set up session
    (req as any).session.userId = user.id;
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        aadhaarNumber: user.aadhaarNumber,
        type: 'user'
      }
    });
    
  } catch (error) {
    console.error('Verify OTP Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Please provide both valid Aadhaar number and OTP' 
      });
    }
    res.status(500).json({ 
      error: 'Failed to verify OTP. Please try again.' 
    });
  }
});

// Function to send biometric approval email
export async function sendBiometricApprovalEmail(userEmail: string, userName: string) {
  const approvalDate = new Date();
  const deadlineDate = new Date(approvalDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .email-container {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #2c3e50;
                color: white;
                text-align: center;
                padding: 20px;
                border-radius: 8px 8px 0 0;
            }
            .content {
                background-color: white;
                padding: 30px;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .info-box {
                background-color: #e8f5e8;
                padding: 15px;
                border-left: 4px solid #27ae60;
                margin: 20px 0;
            }
            .warning-box {
                background-color: #fff3cd;
                padding: 15px;
                border-left: 4px solid #ffc107;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h2>Biometric Verification Approval</h2>
            </div>
            <div class="content">
                <p>Dear ${userName},</p>
                
                <p>We are pleased to inform you that your request for biometric verification has been <strong>approved</strong> by our admin team.</p>
                
                <div class="info-box">
                    <h3 style="color: #27ae60; margin-top: 0;">Next Steps Required:</h3>
                    <p><strong>You are required to visit our office for biometric verification within the coming week.</strong></p>
                    <ul>
                        <li>Approval Date: ${approvalDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
                        <li>Deadline: ${deadlineDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
                        <li>Time Remaining: 7 days from approval</li>
                    </ul>
                </div>
                
                <h3>What to Bring:</h3>
                <ul>
                    <li>Valid government-issued photo ID</li>
                    <li>Any relevant documents related to your application</li>
                    <li>This email confirmation (printed or on mobile)</li>
                </ul>
                
                <h3>Office Hours:</h3>
                <p>Monday - Friday: 9:00 AM - 5:00 PM<br>
                Saturday: 9:00 AM - 1:00 PM<br>
                Sunday: Closed</p>
                
                <div class="warning-box">
                    <p style="margin: 0;"><strong>Important:</strong> Failure to complete biometric verification within the specified timeframe may result in the cancellation of your approval.</p>
                </div>
                
                <p>If you have any questions or need to reschedule, please contact us immediately.</p>
                
                <p>Best regards,<br>
                Admin Team</p>
                
                <hr>
                <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  if (!transporter) {
    throw new Error('Email transporter not initialized');
  }

  const mailOptions = {
    from: `"Government Portal" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: 'Biometric Verification Required - Action Needed',
    html: htmlContent
  };

  return transporter.sendMail(mailOptions);
}

// Route: Admin approves user and sends biometric notification
router.post('/admin/approve-biometric', async (req, res) => {
  try {
    // Validate request body
    const approvalSchema = z.object({
      userId: z.number(),
      adminId: z.number()
    });
    
    const { userId, adminId } = approvalSchema.parse(req.body);
    
    // Get user and admin details
    const user = await storage.getUser(userId);
    const admin = await storage.getAdmin(adminId);
    
    if (!user || !admin) {
      return res.status(404).json({
        error: 'User or admin not found'
      });
    }
    
    // Check if user has email and name
    if (!user.email || !user.name) {
      return res.status(400).json({
        error: 'User email or name is missing'
      });
    }

    // Send approval email
    await sendBiometricApprovalEmail(user.email, user.name);
    
    // Log the approval
    console.log(`Biometric verification approved for user ${user.name} by admin ${admin.name}`);
    
    res.json({
      message: 'Biometric verification approval sent successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Biometric Approval Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Please provide valid user and admin IDs'
      });
    }
    res.status(500).json({
      error: 'Failed to send approval notification. Please try again.'
    });
  }
});

export default router;
