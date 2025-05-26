import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
  file?: Express.Multer.File;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as {
      id: string;
      email: string;
      role: UserRole;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const verifiedOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  // Check if user is verified using Prisma
  prisma.user.findUnique({
    where: { id: req.user.id }
  }).then(user => {
    if (!user || !user.isVerified) {
      res.status(403).json({ success: false, message: 'Email verification required' });
      return;
    }
    next();
  }).catch(() => {
    res.status(500).json({ success: false, message: 'Server error' });
  });
};

// Admin only middleware
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== UserRole.ADMIN) {
    res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
    return;
  }
  
  next();
};

// Vet only middleware
export const vetOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== UserRole.VET) {
    res.status(403).json({ success: false, message: 'Unauthorized. Vet access only.' });
    return;
  }
  
  next();
};
