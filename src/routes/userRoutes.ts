import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/fileHandler';
import * as userHttpController from '../httpControllers/userHttpController';

const router = Router();

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
