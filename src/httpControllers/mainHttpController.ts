import { Request, Response } from 'express';
import { 
  registerUser, 
  verifyEmail, 
  resendVerificationEmail, 
  initiatePasswordReset, 
  resetPassword, 
  loginUser,
  getFeedPosts,
  addReaction,
  addComment,
  deleteComment,
  toggleFavorite,
  toggleSavePost,
  getSavedPosts,
  followUser,
  unfollowUser,
  removeFollower,
  getFollowers,
  getFollowing,
  sendMessage,
  getChatHistory,
  getUserChats
} from '../functionControllers/mainFunctionController';
import { AuthRequest } from '../middlewares/authMiddleware';

export const handleRegister = async (req: Request, res: Response): Promise<void> => {
  // Check if body exists
  if (!req.body) {
    res.status(400).json({ success: false, message: 'Request body is required' });
    return;
  }

  const { email, username, password, firstName, lastName, address } = req.body;

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

  // Address validation if provided
  if (address) {
    if (!address.address || !address.city || !address.state || !address.zipCode) {
      res.status(400).json({ success: false, message: 'Please provide all address fields if address is included' });
      return;
    }

    // Basic zip code validation (5 digits)
    const zipCodeRegex = /^\d{5}$/;
    if (!zipCodeRegex.test(address.zipCode)) {
      res.status(400).json({ success: false, message: 'Please provide a valid 5-digit zip code' });
      return;
    }
  }

  const result = await registerUser({ email, username, password, firstName, lastName, address });
  
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

export const handleGetFeedPosts = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const result = await getFeedPosts(userId, page, limit);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to fetch feed posts' });
  }
};

// Reaction endpoints
export const handleAddReaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { postId, reactionType } = req.body;

    if (!postId || !reactionType) {
      res.status(400).json({ success: false, message: 'Post ID and reaction type are required' });
      return;
    }

    const result = await addReaction(userId, postId, reactionType);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to add reaction' });
  }
};

// Comment endpoints
export const handleAddComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { postId, content, parentId } = req.body;

    if (!postId || !content) {
      res.status(400).json({ success: false, message: 'Post ID and content are required' });
      return;
    }

    const result = await addComment(userId, postId, content, parentId);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
};

export const handleDeleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { commentId } = req.params;

    if (!commentId) {
      res.status(400).json({ success: false, message: 'Comment ID is required' });
      return;
    }

    const result = await deleteComment(userId, commentId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
};

// Favorite endpoints
export const handleToggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { postId } = req.body;

    if (!postId) {
      res.status(400).json({ success: false, message: 'Post ID is required' });
      return;
    }

    const result = await toggleFavorite(userId, postId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to toggle favorite' });
  }
};

// Save post endpoints
export const handleToggleSavePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { postId } = req.body;

    if (!postId) {
      res.status(400).json({ success: false, message: 'Post ID is required' });
      return;
    }

    const result = await toggleSavePost(userId, postId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to toggle save post' });
  }
};

export const handleGetSavedPosts = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const result = await getSavedPosts(userId, page, limit);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to get saved posts' });
  }
};

// Follow endpoints
export const handleFollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { followingId } = req.body;

    if (!followingId) {
      res.status(400).json({ success: false, message: 'User ID to follow is required' });
      return;
    }

    const result = await followUser(userId, followingId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to follow user' });
  }
};

export const handleUnfollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { followingId } = req.body;

    if (!followingId) {
      res.status(400).json({ success: false, message: 'User ID to unfollow is required' });
      return;
    }

    const result = await unfollowUser(userId, followingId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to unfollow user' });
  }
};

export const handleRemoveFollower = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { followerId } = req.body;

    if (!followerId) {
      res.status(400).json({ success: false, message: 'Follower ID is required' });
      return;
    }

    const result = await removeFollower(userId, followerId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to remove follower' });
  }
};

export const handleGetFollowers = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const result = await getFollowers(userId, page, limit);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to get followers' });
  }
};

export const handleGetFollowing = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const result = await getFollowing(userId, page, limit);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to get following' });
  }
};

// Messaging endpoints
export const handleSendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { chatId, content, receiverId } = req.body;
    const file = req.file as Express.Multer.File;

    if (!chatId || (!content && !file) || !receiverId) {
      res.status(400).json({ success: false, message: 'Chat ID, content or file, and receiver ID are required' });
      return;
    }

    const result = await sendMessage(userId, { 
      chatId, 
      content: content || '', 
      receiverId,
      fileUrl: file ? file.path : undefined
    });
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

export const handleGetChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { chatId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!chatId) {
      res.status(400).json({ success: false, message: 'Chat ID is required' });
      return;
    }

    if (page < 1 || limit < 1) {
      res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
      return;
    }

    const result = await getChatHistory(userId, chatId, page, limit);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to get chat history' });
  }
};

export const handleGetUserChats = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const result = await getUserChats(userId, page, limit);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to get user chats' });
  }
};
