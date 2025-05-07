import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const adminLogin = async (email: string, password: string): Promise<{ 
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

    // Check if user is an admin
    if (user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized. Admin access only.'
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
      message: 'Admin login successful',
      token,
      user: userWithoutSensitiveInfo
    };
  } catch (error) {
    console.error('Admin login error:', error);
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
};
