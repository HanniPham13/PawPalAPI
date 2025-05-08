import { Router } from 'express';
import { 
  handleRegister, 
  handleVerifyEmail, 
  handleResendVerification, 
  handleRequestPasswordReset, 
  handleResetPassword,
  handleLogin,
  handleGetFeedPosts,
  handleAddReaction,
  handleAddComment,
  handleDeleteComment,
  handleToggleFavorite,
  handleToggleSavePost,
  handleGetSavedPosts,
  handleFollowUser,
  handleUnfollowUser,
  handleRemoveFollower,
  handleGetFollowers,
  handleGetFollowing,
  handleSendMessage,
  handleGetChatHistory,
  handleGetUserChats
} from '../httpControllers/mainHttpController';
import { authenticate, verifiedOnly } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/fileHandler';

const router = Router();

// Authentication routes
router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.post('/verify-email', handleVerifyEmail);
router.post('/resend-verification', handleResendVerification);
router.post('/forgot-password', handleRequestPasswordReset);
router.post('/reset-password', handleResetPassword);

// Feed routes
router.get('/feed', authenticate, handleGetFeedPosts);

// Interaction routes
router.post('/reactions', authenticate, handleAddReaction);
router.post('/comments', authenticate, handleAddComment);
router.delete('/comments/:commentId', authenticate, handleDeleteComment);
router.post('/favorites', authenticate, handleToggleFavorite);
router.post('/save', authenticate, handleToggleSavePost);
router.get('/saved', authenticate, handleGetSavedPosts);

// Follow routes
router.post('/follow', authenticate, handleFollowUser);
router.post('/unfollow', authenticate, handleUnfollowUser);
router.post('/remove-follower', authenticate, handleRemoveFollower);
router.get('/followers', authenticate, handleGetFollowers);
router.get('/following', authenticate, handleGetFollowing);

// Messaging routes
router.post('/messages', authenticate, upload.single('chatFile'), handleSendMessage);
router.get('/chats/:chatId/messages', authenticate, handleGetChatHistory);
router.get('/chats', authenticate, handleGetUserChats);

export default router;