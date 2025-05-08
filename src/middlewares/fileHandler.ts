import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/profiles',
    'uploads/covers',
    'uploads/posts',
    'uploads/verification',  // New directory for verification documents
    'uploads/rehoming',      // New directory for rehoming files
    'uploads/chat'          // New directory for chat files
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      cb(new Error('User not authenticated'), '');
      return;
    }

    let uploadPath = 'uploads/';
    if (file.fieldname === 'profilePicture') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'coverPicture') {
      uploadPath += 'covers/';
    } else if (file.fieldname === 'postImage') {
      uploadPath += 'posts/';
    } else if (file.fieldname === 'documents') {
      uploadPath += 'verification/';
    } else if (file.fieldname === 'rehomingImage') {
      uploadPath += 'rehoming/';
    } else if (file.fieldname === 'chatFile') {
      uploadPath += 'chat/';
    }

    // Create user-specific directory
    const userDir = path.join(uploadPath, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    cb(null, userDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and PDF are allowed.'));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
