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
    'uploads/petProfile',     // Directory for pet profile pictures
    'uploads/medical',        // Directory for pet medical records
    'uploads/verification',   // New directory for verification documents
    'uploads/rehoming',       // New directory for rehoming files
    'uploads/chat',           // New directory for chat files
    'uploads/clinics',         // Base directory for clinic files
    'uploads/clinics/profiles', // Clinic profile pictures
    'uploads/clinics/covers',   // Clinic cover pictures
    'uploads/clinics/images'    // Other clinic images
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Helper function to normalize paths with forward slashes
const normalizePath = (pathString: string): string => {
  return pathString.split(path.sep).join('/');
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      cb(new Error('User not authenticated'), '');
      return;
    }

    let uploadPath = 'uploads/';
    if (file.fieldname === 'profilePicture' && req.originalUrl.includes('/pet')) {
      // Pet profile pictures
      uploadPath += 'petProfile/';
    } else if (file.fieldname === 'profilePicture' && req.originalUrl.includes('/vet/clinics')) {
      // Clinic profile pictures
      uploadPath += 'clinics/profiles/';
    } else if (file.fieldname === 'profilePicture') {
      // User profile pictures
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'coverPicture' && req.originalUrl.includes('/vet/clinics')) {
      // Clinic cover pictures
      uploadPath += 'clinics/covers/';
    } else if (file.fieldname === 'coverPicture') {
      uploadPath += 'covers/';
    } else if (file.fieldname === 'postImage') {
      uploadPath += 'posts/';
    } else if (file.fieldname === 'medicalDocument') {
      // Medical records for pets
      uploadPath += 'medical/';
    } else if (file.fieldname === 'documents') {
      uploadPath += 'verification/';
    } else if (file.fieldname === 'rehomingImage') {
      uploadPath += 'rehoming/';
    } else if (file.fieldname === 'chatFile') {
      uploadPath += 'chat/';
    } else if (file.fieldname === 'clinicImages') {
      // Clinic images
      uploadPath += 'clinics/images/';
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
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP and PDF are allowed.'));
  }
};

// Override the default multer behavior to normalize paths
const normalizedMulter = (options: multer.Options) => {
  const middleware = multer(options);
  
  // Create a wrapper for the single method
  const originalSingle = middleware.single;
  middleware.single = function(fieldname: string) {
    const middleware = originalSingle.call(this, fieldname);
    return (req: Request, res: any, next: any) => {
      middleware(req, res, (err: any) => {
        if (err) {
          return next(err);
        }
        
        // Normalize file path before continuing
        if (req.file && req.file.path) {
          req.file.path = normalizePath(req.file.path);
        }
        
        next();
      });
    };
  };
  
  // Create a wrapper for the array method
  const originalArray = middleware.array;
  middleware.array = function(fieldname: string, maxCount?: number) {
    const middleware = originalArray.call(this, fieldname, maxCount);
    return (req: Request, res: any, next: any) => {
      middleware(req, res, (err: any) => {
        if (err) {
          return next(err);
        }
        
        // Normalize file paths before continuing
        if (req.files && Array.isArray(req.files)) {
          req.files.forEach((file: any) => {
            if (file.path) {
              file.path = normalizePath(file.path);
            }
          });
        }
        
        next();
      });
    };
  };
  
  return middleware;
};

// Configure multer with our normalized wrapper
export const upload = normalizedMulter({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
