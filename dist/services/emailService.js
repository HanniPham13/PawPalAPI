"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationRejectionEmail = exports.sendVerificationApprovalEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create transporter object
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
// Send email with verification code
const sendVerificationEmail = (user, code) => __awaiter(void 0, void 0, void 0, function* () {
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
        const info = yield transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return true;
    }
    catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
// Send email for password reset
const sendPasswordResetEmail = (user, resetToken) => __awaiter(void 0, void 0, void 0, function* () {
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
        const info = yield transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return true;
    }
    catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
// Send email for verification approval
const sendVerificationApprovalEmail = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'PawPal - Verification Approved',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Congratulations, ${user.firstName} ${user.lastName}!</h2>
          <p>We're pleased to inform you that your verification request has been <strong style="color: #4CAF50;">approved</strong>.</p>
          <p>You are now a verified PurrParent on PawPal, which gives you the ability to:</p>
          <ul style="padding-left: 20px; line-height: 1.6;">
            <li>Apply to adopt pets</li>
            <li>Participate in adoption events</li>
            <li>Access exclusive PurrParent features</li>
          </ul>
          <p>Thank you for being a part of our community and for your commitment to animal welfare.</p>
          <p>Best regards,<br>PawPal Team</p>
        </div>
      `
        };
        // Send email
        const info = yield transporter.sendMail(mailOptions);
        console.log('Verification approval email sent:', info.messageId);
        return true;
    }
    catch (error) {
        console.error('Error sending verification approval email:', error);
        return false;
    }
});
exports.sendVerificationApprovalEmail = sendVerificationApprovalEmail;
// Send email for verification rejection
const sendVerificationRejectionEmail = (user, reason) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'PawPal - Verification Update',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Hello, ${user.firstName} ${user.lastName}</h2>
          <p>We've reviewed your verification request and unfortunately, we were unable to approve it at this time.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>You can submit a new verification request with the required documents through the app. Please ensure that:</p>
          <ul style="padding-left: 20px; line-height: 1.6;">
            <li>All documents are clearly visible and not blurry</li>
            <li>Information in the documents is up-to-date</li>
            <li>You've submitted all the required document types</li>
          </ul>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>PawPal Team</p>
        </div>
      `
        };
        // Send email
        const info = yield transporter.sendMail(mailOptions);
        console.log('Verification rejection email sent:', info.messageId);
        return true;
    }
    catch (error) {
        console.error('Error sending verification rejection email:', error);
        return false;
    }
});
exports.sendVerificationRejectionEmail = sendVerificationRejectionEmail;
