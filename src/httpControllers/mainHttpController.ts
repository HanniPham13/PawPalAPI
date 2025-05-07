import { Request, Response } from 'express';
import { registerUser, verifyEmail, resendVerificationEmail, initiatePasswordReset, resetPassword, loginUser } from '../functionControllers/mainFunctionController';

export const handleRegister = async (req: Request, res: Response): Promise<void> => {
  // Check if body exists
  if (!req.body) {
    res.status(400).json({ success: false, message: 'Request body is required' });
    return;
  }

  const { email, username, password, firstName, lastName } = req.body;

  // Validate input
  if (!email || !username || !password || !firstName || !lastName) {
    res.status(400).json({ success: false, message: 'Please provide all required fields' });
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    return;
  }

  // Password validation (at least 8 characters)
  if (password.length < 8) {
    res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    return;
  }

  const result = await registerUser({ email, username, password, firstName, lastName });
  
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
};

export const handleLogin = async (req: Request, res: Response): Promise<void> => {
  // Check if body exists
  if (!req.body) {
    res.status(400).json({ success: false, message: 'Request body is required' });
    return;
  }

  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    return;
  }

  const result = await loginUser(email, password);
  
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(401).json(result);
  }
};

export const handleVerifyEmail = async (req: Request, res: Response): Promise<void> => {
  if (!req.body) {
    res.status(400).json({ success: false, message: 'Request body is required' });
    return;
  }

  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({ success: false, message: 'Email and verification code are required' });
    return;
  }

  const result = await verifyEmail(email, code);
  
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
};

export const handleResendVerification = async (req: Request, res: Response): Promise<void> => {
  if (!req.body) {
    res.status(400).json({ success: false, message: 'Request body is required' });
    return;
  }

  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required' });
    return;
  }

  const result = await resendVerificationEmail(email);
  
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
};

export const handleRequestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  if (!req.body) {
    res.status(400).json({ success: false, message: 'Request body is required' });
    return;
  }

  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required' });
    return;
  }

  const result = await initiatePasswordReset(email);
  
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
};

export const handleResetPassword = async (req: Request, res: Response): Promise<void> => {
  if (!req.body) {
    res.status(400).json({ success: false, message: 'Request body is required' });
    return;
  }
  
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    res.status(400).json({ success: false, message: 'Email, token, and new password are required' });
    return;
  }

  // Password validation
  if (newPassword.length < 8) {
    res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    return;
  }

  const result = await resetPassword(email, token, newPassword);
  
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
};
