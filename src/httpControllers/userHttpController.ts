import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as userFunctionController from '../functionControllers/userFunctionController';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleGetUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const result = await userFunctionController.getUserProfile(userId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile' });
  }
};

export const handleUploadProfilePicture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const filePath = req.file.path.replace(/\\/g, '/');
    const result = await userFunctionController.uploadProfilePicture(userId, filePath);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload profile picture' });
  }
};

export const handleUploadCoverPicture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const filePath = req.file.path.replace(/\\/g, '/');
    const result = await userFunctionController.uploadCoverPicture(userId, filePath);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to upload cover picture' });
  }
};

export const handleDeleteProfilePicture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const result = await userFunctionController.deleteProfilePicture(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete profile picture' });
  }
};

export const handleDeleteCoverPicture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const result = await userFunctionController.deleteCoverPicture(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete cover picture' });
  }
};

export const handleUpdateProfileInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { firstName, lastName, bio, username } = req.body;
    const result = await userFunctionController.updateProfileInfo(userId, {
      firstName,
      lastName,
      bio,
      username
    });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to update profile information' });
  }
};

export const handleChangePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current password and new password are required' });
      return;
    }

    const result = await userFunctionController.changePassword(userId, currentPassword, newPassword);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

export const handleUpdateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { address, city, state, zipCode } = req.body;

    if (!address || !city || !state || !zipCode) {
      res.status(400).json({ success: false, message: 'All address fields are required' });
      return;
    }

    const result = await userFunctionController.updateAddress(userId, {
      address,
      city,
      state,
      zipCode
    });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to update address' });
  }
};

export const handleCreateSocialPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { content, taggedPetIds } = req.body;
    const images = req.files ? (req.files as Express.Multer.File[]).map(file => file.path.replace(/\\/g, '/')) : undefined;

    if (!content) {
      res.status(400).json({ success: false, message: 'Content is required' });
      return;
    }

    const result = await userFunctionController.createSocialPost(userId, {
      content,
      images,
      taggedPetIds: taggedPetIds ? JSON.parse(taggedPetIds) : undefined
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to create social post' });
  }
};

export const handleDeleteSocialPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { postId } = req.params;
    if (!postId) {
      res.status(400).json({ success: false, message: 'Post ID is required' });
      return;
    }

    const result = await userFunctionController.deleteSocialPost(userId, postId);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to delete social post' });
  }
};

export const handleGetSocialPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    if (!postId) {
      res.status(400).json({ success: false, message: 'Post ID is required' });
      return;
    }

    const result = await userFunctionController.getSocialPost(postId);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to get social post' });
  }
};

export const handleApplyForPurrparentVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'At least one document is required' });
      return;
    }

    const documentType = req.body.documentType;
    if (!documentType || !['ID_CARD', 'DRIVERS_LICENSE', 'PASSPORT', 'PROOF_OF_ADDRESS', 'VET_LICENSE', 'PET_MEDICAL_RECORD', 'ADOPTION_FORM', 'OTHER'].includes(documentType)) {
      res.status(400).json({ success: false, message: 'Valid document type is required' });
      return;
    }

    const documents = files.map(file => ({
      documentType: documentType as 'ID_CARD' | 'DRIVERS_LICENSE' | 'PASSPORT' | 'PROOF_OF_ADDRESS' | 'VET_LICENSE' | 'PET_MEDICAL_RECORD' | 'ADOPTION_FORM' | 'OTHER',
      documentUrl: file.path.replace(/\\/g, '/')
    }));

    const result = await userFunctionController.applyForPurrparentVerification(userId, documents);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to submit verification request' });
  }
};

export const handleCreatePetAdoptionPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { title, description, location, petProfileId } = req.body;
    const images = req.files ? (req.files as Express.Multer.File[]).map(file => file.path.replace(/\\/g, '/')) : undefined;

    if (!title || !description) {
      res.status(400).json({ success: false, message: 'Title and description are required' });
      return;
    }

    const result = await userFunctionController.createPetAdoptionPost(userId, {
      title,
      description,
      location,
      petProfileId,
      images
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to create pet adoption post' });
  }
};

export const handleGetUserAdoptionPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1 || limit < 1) {
      res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
      return;
    }

    const result = await userFunctionController.getUserAdoptionPosts(userId, page, limit);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to get adoption posts' });
  }
};

export const handleDeletePetAdoptionPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { postId } = req.params;
    if (!postId) {
      res.status(400).json({ success: false, message: 'Post ID is required' });
        return;
      }

    const result = await userFunctionController.deletePetAdoptionPost(userId, postId);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to delete adoption post' });
  }
};

export const handleApplyForAdoption = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

    const { adoptionPostId, message } = req.body;
    
    if (!adoptionPostId || !message) {
      res.status(400).json({ success: false, message: 'Adoption post ID and message are required' });
      return;
    }

    const result = await userFunctionController.applyForAdoption(userId, {
      adoptionPostId,
      message
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to apply for adoption' });
  }
};

export const handleGetMyAdoptionApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1 || limit < 1) {
      res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
      return;
    }

    const result = await userFunctionController.getMyAdoptionApplications(userId, page, limit);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to get adoption applications' });
  }
};

export const handleGetReceivedAdoptionApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1 || limit < 1) {
      res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
      return;
    }

    const result = await userFunctionController.getReceivedAdoptionApplications(userId, page, limit);
      res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to get received adoption applications' });
  }
};

export const handleUpdateAdoptionApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { applicationId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!applicationId || !status || (status === 'REJECTED' && !rejectionReason)) {
      res.status(400).json({ 
        success: false, 
        message: 'Application ID, status, and rejection reason (if rejecting) are required' 
      });
      return;
    }

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
      return;
    }

    const result = await userFunctionController.updateAdoptionApplicationStatus(userId, applicationId, {
      status: status as 'APPROVED' | 'REJECTED',
      rejectionReason
    });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to update application status' });
  }
};

export const handleApproveAdoptionApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { applicationId } = req.params;
    if (!applicationId) {
      res.status(400).json({ success: false, message: 'Application ID is required' });
      return;
    }

    const result = await userFunctionController.updateAdoptionApplicationStatus(userId, applicationId, {
      status: 'APPROVED'
    });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to approve application' });
  }
};

export const handleRejectAdoptionApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { applicationId } = req.params;
    const { rejectionReason } = req.body;

    if (!applicationId) {
      res.status(400).json({ success: false, message: 'Application ID is required' });
      return;
    }

    if (!rejectionReason) {
      res.status(400).json({ success: false, message: 'Rejection reason is required' });
      return;
    }

    const result = await userFunctionController.updateAdoptionApplicationStatus(userId, applicationId, {
      status: 'REJECTED',
      rejectionReason
    });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to reject application' });
  }
};

export const handleGetAllAdoptionPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1 || limit < 1) {
      res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
      return;
    }

    const result = await userFunctionController.getAllAdoptionPosts(page, limit);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to get adoption posts' });
  }
};

