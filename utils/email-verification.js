import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

dotenv.config();

// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

let transporter = null;

const smtpPort = Number(process.env.SMTP_PORT) || 587;
const isSecurePort = smtpPort === 465;

// Validate environment variables
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn("⚠️  SMTP configuration missing. Email functionality may not work.");
  console.warn("Required: SMTP_HOST, SMTP_USER, SMTP_PASS");
}

transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: isSecurePort,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2',
    ciphers: 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256',
  },
  debug: false, // Set to false to reduce console noise, set to true for debugging
  logger: false, // Set to false to reduce console noise
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
    console.error("Error Code:", error.code);
    console.error("Error Response:", error.response);
    console.error("\n💡 Troubleshooting Tips:");
    console.error("1. Check if SMTP_HOST, SMTP_USER, and SMTP_PASS are set in .env");
    console.error("2. For Gmail, use an App Password (not your regular password)");
    console.error("3. Enable 2-Step Verification in your Google Account");
    console.error("4. Generate App Password: https://myaccount.google.com/apppasswords");
    console.error("5. Ensure SMTP_PORT is correct (587 for TLS, 465 for SSL)");
  } else {
    console.log("✅ SMTP is ready to send emails");
    console.log(`📧 SMTP Server: ${process.env.SMTP_HOST}:${smtpPort}`);
  }
});

export const sendVerificationMail = async (email, verificationCode) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }

    // Validate SMTP configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP credentials not configured. Please check your .env file.');
    }

    const mailOptions = {
      from: `"Job Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Email Verification Code",
      text: `Hello,\n\nYour verification code is: ${verificationCode}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hello,</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${verificationCode}
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Error sending verification email to ${email}:`);
    console.error(`   Error: ${err.message}`);
    console.error(`   Code: ${err.code || 'N/A'}`);
    
    // Provide helpful error messages
    if (err.code === 'EAUTH') {
      console.error('\n💡 Authentication Error - Solutions:');
      console.error('   1. For Gmail, use an App Password (not your regular password)');
      console.error('   2. Enable 2-Step Verification in Google Account');
      console.error('   3. Generate App Password: https://myaccount.google.com/apppasswords');
      console.error('   4. Make sure SMTP_USER is your full email address');
    } else if (err.code === 'ECONNECTION' || err.code === 'ETIMEDOUT') {
      console.error('\n💡 Connection Error - Solutions:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify SMTP_HOST is correct');
      console.error('   3. Check if firewall is blocking the connection');
      console.error('   4. Try using port 587 (TLS) or 465 (SSL)');
    } else if (err.code === 'EENVELOPE') {
      console.error('\n💡 Envelope Error - Solutions:');
      console.error('   1. Check if recipient email is valid');
      console.error('   2. Verify sender email (SMTP_USER) is correct');
    }
    
    throw err;
  }
};

export const sendVerificationLink = async (email, userId) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }

    // Validate SMTP configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP credentials not configured. Please check your .env file.');
    }

    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '10m' });
    const verificationLink = `${process.env.APP_URL}/api/customer/verify-email/${token}`;
    
    const mailOptions = {
      from: `"Job Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify Your Email",
      text: `Hello,\n\nPlease click the following link to verify your email:\n\n${verificationLink}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request this verification, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hello,</p>
          <p>Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationLink}</p>
          <p>This link will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification link sent to ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Error sending verification link to ${email}:`);
    console.error(`   Error: ${err.message}`);
    console.error(`   Code: ${err.code || 'N/A'}`);
    throw err;
  }
};