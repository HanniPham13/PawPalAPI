import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/fileHandler';
import * as userHttpController from '../httpControllers/userHttpController';
import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../index';

const router = Router();

// Get current user profile - temporary direct implementation 
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    // Get the user with their profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        coverPicture: true
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Extract password and other sensitive fields
    const { password, ...userData } = user;

    res.status(200).json({ 
      success: true, 
      message: 'User profile retrieved successfully',
      data: userData
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile' });
  }
});

// Profile picture routes
router.post('/profile-picture', authenticate, upload.single('profilePicture'), userHttpController.handleUploadProfilePicture);
router.delete('/profile-picture', authenticate, userHttpController.handleDeleteProfilePicture);
// Cover picture routes
router.post('/cover-picture', authenticate, upload.single('coverPicture'), userHttpController.handleUploadCoverPicture);
router.delete('/cover-picture', authenticate, userHttpController.handleDeleteCoverPicture);
// Profile information routes
router.patch('/profile', authenticate, userHttpController.handleUpdateProfileInfo);
// Password change route
router.post('/change-password', authenticate, userHttpController.handleChangePassword);
// Address routes
router.put('/address', authenticate, userHttpController.handleUpdateAddress);

// Social post routes
router.post('/posts', authenticate, upload.array('postImage', 5), userHttpController.handleCreateSocialPost);
router.delete('/posts/:postId', authenticate, userHttpController.handleDeleteSocialPost);
router.get('/posts/:postId', authenticate, userHttpController.handleGetSocialPost);

// Purrparent verification route
router.post('/verify/purrparent', authenticate, upload.array('documents', 5), userHttpController.handleApplyForPurrparentVerification);

// Pet adoption post routes
router.post('/adoption-posts', authenticate, upload.array('rehomingImage', 5), userHttpController.handleCreatePetAdoptionPost);
router.get('/adoption-posts', authenticate, userHttpController.handleGetUserAdoptionPosts);
router.delete('/adoption-posts/:postId', authenticate, userHttpController.handleDeletePetAdoptionPost);

// Pet adoption application routes
router.post('/adoption-applications', authenticate, userHttpController.handleApplyForAdoption);
router.get('/adoption-applications', authenticate, userHttpController.handleGetMyAdoptionApplications);
router.get('/adoption-applications/received', authenticate, userHttpController.handleGetReceivedAdoptionApplications);
router.put('/adoption-applications/:applicationId/approve', authenticate, userHttpController.handleApproveAdoptionApplication);
router.put('/adoption-applications/:applicationId/reject', authenticate, userHttpController.handleRejectAdoptionApplication);

export default router;
