import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { User } from '@prisma/client';

dotenv.config();

// Create transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email with verification code
export const sendVerificationEmail = async (user: any, code: string): Promise<boolean> => {
  try {
    // Create email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'PawPal - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Welcome to PawPal, ${user.firstName} ${user.lastName}!</h2>
          <p>Thank you for registering with PawPal. To complete your registration, please use the verification code below:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; border-radius: 5px;">
            ${code}
          </div>
          <p>This code will expire in 24 hours.</p>
          <p>If you did not request this verification, please ignore this email.</p>
          <p>Best regards,<br>PawPal Team</p>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send email for password reset
export const sendPasswordResetEmail = async (user: any, resetToken: string): Promise<boolean> => {
  try {
    // Create email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'PawPal - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Hello, ${user.firstName} ${user.lastName}!</h2>
          <p>We received a request to reset your password. Please use the code below to reset your password:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; border-radius: 5px;">
            ${resetToken}
          </div>
          <p>This code will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p>Best regards,<br>PawPal Team</p>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};
