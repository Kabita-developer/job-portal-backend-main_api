import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

dotenv.config();

// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

let transporter = null;

const smtpPort = Number(process.env.SMTP_PORT);
const isSecurePort = smtpPort === 465;

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
  debug: true,
  logger: true,
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP is ready to send emails");
  }
});

export const sendVerificationMail = async (email, verificationCode) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Email Verification Code",
      text: `Hello, Your verification code is: ${verificationCode}`,
      html: `<p>Hello, Your verification code is: <strong>${verificationCode}</strong></p>`,
    });
    console.log(`Verification email sent to ${email}`);
  } catch (err) {
    console.error(`Error sending verification email to ${email}:`, err);
    throw err;
  }
};

export const sendVerificationLink = async (email, userId) => {
  try {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '10m' });
    const verificationLink = `${process.env.APP_URL}/api/customer/verify-email/${token}`;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Hello, Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
    });
    console.log(`Verification link sent to ${email}`);
  } catch (err) {
    console.error(`Error sending verification link to ${email}:`, err);
    throw err;
  }
};