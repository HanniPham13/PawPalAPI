import { Request, Response } from 'express';
import { adminLogin } from '../functionControllers/adminFunctionController';

export const handleAdminLogin = async (req: Request, res: Response): Promise<void> => {
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

  const result = await adminLogin(email, password);
  
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(401).json(result);
  }
};
