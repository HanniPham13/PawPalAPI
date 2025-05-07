import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const registerUser = async (userData: {
  email: string;
  username: string;
  password: string;
  firstName:string;
  lastName:string;
}): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    // Check if email is already in use
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    // If email exists but is not verified, resend verification
    if (existingUserByEmail && !existingUserByEmail.isVerified) {
      const resendResult = await resendVerificationEmail(userData.email);
      return {
        success: true,
        message: 'This email is registered but not verified. We have sent a new verification email.'
      };
    }

    // Check if username is already taken
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: userData.username }
    });

    if (existingUserByEmail) {
      return {
        success: false,
        message: 'Email already in use'
      };
    }

    if (existingUserByUsername) {
      return {
        success: false,
        message: 'Username already taken'
      };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Generate verification code - 6 digit numeric code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        verificationCode,
        isVerified: false
      }
    });

    // Send verification email
    await sendVerificationEmail(newUser, verificationCode);

    // Return user without sensitive information
    const { password, verificationCode: code, ...userWithoutSensitiveInfo } = newUser;
    
    return {
      success: true,
      message: 'User registered successfully! Please check your email to verify your account.',
      user: userWithoutSensitiveInfo as User
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'An error occurred during registration'
    };
  }
};

export const verifyEmail = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.isEmailVerified) {
      return { success: false, message: 'Email already verified' };
    }

    if (user.verificationCode !== code) {
      return { success: false, message: 'Invalid verification code' };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        isEmailVerified: true,
        verificationCode: null
      }
    });

    return { success: true, message: 'Email verified successfully' };
  } catch (error) {
    console.error('Verification error:', error);
    return { success: false, message: 'An error occurred during verification' };
  }
};

export const resendVerificationEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.isEmailVerified) {
      return { success: false, message: 'Email is already verified' };
    }

    // Generate new verification code - 6 digit numeric code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user with new verification code
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode }
    });

    // Send new verification email
    await sendVerificationEmail(user, verificationCode);

    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Resend verification error:', error);
    return { success: false, message: 'An error occurred while resending verification email' };
  }
};

export const initiatePasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: resetToken,
        updatedAt: new Date()
      }
    });

    // Send password reset email
    await sendPasswordResetEmail(user, resetToken);

    return { success: true, message: 'Password reset instructions sent to your email' };
  } catch (error) {
    console.error('Password reset initiation error:', error);
    return { success: false, message: 'An error occurred while processing password reset' };
  }
};

export const resetPassword = async (
  email: string, 
  resetToken: string, 
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.verificationCode !== resetToken) {
      return { success: false, message: 'Invalid or expired reset token' };
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user with new password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationCode: null
      }
    });

    return { success: true, message: 'Password reset successful' };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, message: 'An error occurred while resetting password' };
  }
};

export const loginUser = async (email: string, password: string): Promise<{ 
  success: boolean; 
  message: string; 
  token?: string;
  user?: Partial<User>;
}> => {
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Check if user exists
    if (!user) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Check if user email is verified
    if (!user.isEmailVerified) {
      return {
        success: false,
        message: 'Please verify your email before logging in'
      };
    }

    // Check if user is not an admin (only USER and VET roles allowed)
    if (user.role === 'ADMIN') {
      return {
        success: false,
        message: 'Please use admin login for administrator accounts'
      };
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password: _, verificationCode: __, ...userWithoutSensitiveInfo } = user;

    return {
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutSensitiveInfo
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
};
