import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const registerUser = async (userData: {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    // Check if email is already in use
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    // If email exists but is not verified, resend verification
    if (existingUserByEmail && !existingUserByEmail.isVerified) {
      const resendResult = await resendVerificationEmail(userData.email);
      return {
        success: true,
        message: 'This email is registered but not verified. We have sent a new verification email.'
      };
    }

    // Check if username is already taken
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: userData.username }
    });

    if (existingUserByEmail) {
      return {
        success: false,
        message: 'Email already in use'
      };
    }

    if (existingUserByUsername) {
      return {
        success: false,
        message: 'Username already taken'
      };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Generate verification code - 6 digit numeric code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user with optional address
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        verificationCode,
        isVerified: false,
        FullAddress: userData.address ? {
          create: {
            address: userData.address.address,
            city: userData.address.city,
            state: userData.address.state,
            zipCode: userData.address.zipCode
          }
        } : undefined
      },
      include: {
        FullAddress: true
      }
    });

    // Send verification email
    await sendVerificationEmail(newUser, verificationCode);

    // Return user without sensitive information
    const { password, verificationCode: code, ...userWithoutSensitiveInfo } = newUser;
    
    return {
      success: true,
      message: 'User registered successfully! Please check your email to verify your account.',
      user: userWithoutSensitiveInfo as unknown as User
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'An error occurred during registration'
    };
  }
};

export const verifyEmail = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.isEmailVerified) {
      return { success: false, message: 'Email already verified' };
    }

    if (user.verificationCode !== code) {
      return { success: false, message: 'Invalid verification code' };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        isEmailVerified: true,
        verificationCode: null
      }
    });

    return { success: true, message: 'Email verified successfully' };
  } catch (error) {
    console.error('Verification error:', error);
    return { success: false, message: 'An error occurred during verification' };
  }
};

export const resendVerificationEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.isEmailVerified) {
      return { success: false, message: 'Email is already verified' };
    }

    // Generate new verification code - 6 digit numeric code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user with new verification code
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode }
    });

    // Send new verification email
    await sendVerificationEmail(user, verificationCode);

    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Resend verification error:', error);
    return { success: false, message: 'An error occurred while resending verification email' };
  }
};

export const initiatePasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: resetToken,
        updatedAt: new Date()
      }
    });

    // Send password reset email
    await sendPasswordResetEmail(user, resetToken);

    return { success: true, message: 'Password reset instructions sent to your email' };
  } catch (error) {
    console.error('Password reset initiation error:', error);
    return { success: false, message: 'An error occurred while processing password reset' };
  }
};

export const resetPassword = async (
  email: string, 
  resetToken: string, 
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.verificationCode !== resetToken) {
      return { success: false, message: 'Invalid or expired reset token' };
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user with new password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationCode: null
      }
    });

    return { success: true, message: 'Password reset successful' };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, message: 'An error occurred while resetting password' };
  }
};

export const loginUser = async (email: string, password: string): Promise<{ 
  success: boolean; 
  message: string; 
  token?: string;
  user?: Partial<User>;
}> => {
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Check if user exists
    if (!user) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Check if user email is verified
    if (!user.isEmailVerified) {
      return {
        success: false,
        message: 'Please verify your email before logging in'
      };
    }

    // Check if user is not an admin (only USER and VET roles allowed)
    if (user.role === 'ADMIN') {
      return {
        success: false,
        message: 'Please use admin login for administrator accounts'
      };
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password: _, verificationCode: __, ...userWithoutSensitiveInfo } = user;

    return {
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutSensitiveInfo
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
};

export const getFeedPosts = async (userId: string, page: number = 1, limit: number = 10): Promise<{ 
  success: boolean; 
  message: string; 
  data?: any;
  hasMore: boolean;
}> => {
  try {
    const skip = (page - 1) * limit;

    // Get all posts with their engagement metrics
    const posts = await prisma.socialPost.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            verificationLevel: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            },
            followers: {
              select: {
                followerId: true
              }
            }
          }
        },
        taggedPets: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        SocialPostImage: true,
        _count: {
          select: {
            reactions: true,
            comments: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: [
        // First order by recency (newer posts first)
        {
          createdAt: 'desc'
        }
      ],
      skip,
      take: limit + 1 // Get one extra to check if there are more
    });

    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

    // Calculate engagement score and apply algorithm
    const postsWithScore = postsToReturn.map(post => {
      // Base engagement score
      const baseScore = post._count.reactions + (post._count.comments * 2);
      
      // Time decay factor (posts older than 24 hours get reduced score)
      const hoursSinceCreation = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
      const timeDecay = Math.max(0.5, 1 - (hoursSinceCreation / 24)); // Minimum 0.5 score for older posts
      
      // Verification bonus
      const isVerified = ['VERIFIED', 'PURRPARENT', 'SUPER_ADOPTER', 'VET'].includes(post.author.verificationLevel);
      const verificationBonus = isVerified ? 1.5 : 1;
      
      // Following bonus
      const isFollowing = post.author.followers.some(follower => follower.followerId === userId);
      const followingBonus = isFollowing ? 1.3 : 1;
      
      // Calculate final score
      const finalScore = baseScore * timeDecay * verificationBonus * followingBonus;

      return {
        ...post,
        engagementScore: finalScore,
        isVerified,
        isFollowing
      };
    });

    // Sort by final engagement score
    postsWithScore.sort((a, b) => b.engagementScore - a.engagementScore);

    return {
      success: true,
      message: 'Feed posts retrieved successfully',
      data: postsWithScore,
      hasMore
    };
  } catch (error) {
    console.error('Feed posts error:', error);
    return {
      success: false,
      message: 'An error occurred while fetching feed posts',
      hasMore: false
    };
  }
};

// Reaction functions
export const addReaction = async (userId: string, postId: string, reactionType: 'LIKE' | 'LOVE' | 'CARE' | 'LAUGH' | 'SAD' | 'ANGRY' | 'WOW'): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // Check if post exists
    const post = await prisma.socialPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return { success: false, message: 'Post not found' };
    }

    // Check if user already reacted
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    });

    if (existingReaction) {
      // If same reaction type, remove it (toggle)
      if (existingReaction.type === reactionType) {
        await prisma.reaction.delete({
          where: {
            id: existingReaction.id
          }
        });
        return { success: true, message: 'Reaction removed' };
      }
      // If different reaction type, update it
      const updatedReaction = await prisma.reaction.update({
        where: {
          id: existingReaction.id
        },
        data: {
          type: reactionType
        }
      });
      return { success: true, message: 'Reaction updated', data: updatedReaction };
    }

    // Create new reaction
    const reaction = await prisma.reaction.create({
      data: {
        type: reactionType,
        postId,
        userId
      }
    });

    return { success: true, message: 'Reaction added', data: reaction };
  } catch (error) {
    console.error('Add reaction error:', error);
    return { success: false, message: 'Failed to add reaction' };
  }
};

// Comment functions
export const addComment = async (userId: string, postId: string, content: string, parentId?: string): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // Check if post exists
    const post = await prisma.socialPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return { success: false, message: 'Post not found' };
    }

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });

      if (!parentComment) {
        return { success: false, message: 'Parent comment not found' };
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: userId,
        parentId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            }
          }
        }
      }
    });

    return { success: true, message: 'Comment added', data: comment };
  } catch (error) {
    console.error('Add comment error:', error);
    return { success: false, message: 'Failed to add comment' };
  }
};

export const deleteComment = async (userId: string, commentId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        authorId: userId
      }
    });

    if (!comment) {
      return { success: false, message: 'Comment not found or you don\'t have permission to delete it' };
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    return { success: true, message: 'Comment deleted successfully' };
  } catch (error) {
    console.error('Delete comment error:', error);
    return { success: false, message: 'Failed to delete comment' };
  }
};

// Favorite functions
export const toggleFavorite = async (userId: string, postId: string): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // Check if post exists
    const post = await prisma.socialPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return { success: false, message: 'Post not found' };
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId,
        socialPostId: postId
      }
    });

    if (existingFavorite) {
      // Remove favorite
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      });
      return { success: true, message: 'Post removed from favorites' };
    }

    // Add favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        socialPostId: postId
      }
    });

    return { success: true, message: 'Post added to favorites', data: favorite };
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return { success: false, message: 'Failed to toggle favorite' };
  }
};

// Save post functions
export const toggleSavePost = async (userId: string, postId: string): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // Check if post exists
    const post = await prisma.socialPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return { success: false, message: 'Post not found' };
    }

    // Check if already saved
    const existingSave = await prisma.savedPost.findFirst({
      where: {
        userId,
        postId
      }
    });

    if (existingSave) {
      // Remove save
      await prisma.savedPost.delete({
        where: { id: existingSave.id }
      });
      return { success: true, message: 'Post removed from saved' };
    }

    // Add save
    const savedPost = await prisma.savedPost.create({
      data: {
        userId,
        postId
      }
    });

    return { success: true, message: 'Post saved', data: savedPost };
  } catch (error) {
    console.error('Toggle save post error:', error);
    return { success: false, message: 'Failed to toggle save post' };
  }
};

export const getSavedPosts = async (userId: string, page: number = 1, limit: number = 10): Promise<{ success: boolean; message: string; data?: any; hasMore: boolean }> => {
  try {
    const skip = (page - 1) * limit;

    const savedPosts = await prisma.savedPost.findMany({
      where: {
        userId
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                verificationLevel: true,
                profile: {
                  select: {
                    profilePictureUrl: true
                  }
                }
              }
            },
            taggedPets: {
              select: {
                id: true,
                name: true,
                profilePicture: true
              }
            },
            SocialPostImage: true,
            _count: {
              select: {
                reactions: true,
                comments: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit + 1
    });

    const hasMore = savedPosts.length > limit;
    const postsToReturn = hasMore ? savedPosts.slice(0, limit) : savedPosts;

    return {
      success: true,
      message: 'Saved posts retrieved successfully',
      data: postsToReturn.map(sp => sp.post),
      hasMore
    };
  } catch (error) {
    console.error('Get saved posts error:', error);
    return {
      success: false,
      message: 'Failed to get saved posts',
      hasMore: false
    };
  }
};

// Follow functions
export const followUser = async (followerId: string, followingId: string): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // Check if trying to follow self
    if (followerId === followingId) {
      return { success: false, message: 'Cannot follow yourself' };
    }

    // Check if user to follow exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId }
    });

    if (!userToFollow) {
      return { success: false, message: 'User to follow not found' };
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (existingFollow) {
      return { success: false, message: 'Already following this user' };
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            }
          }
        },
        following: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            }
          }
        }
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'FOLLOW',
        message: `${follow.follower.username} started following you`,
        receiverId: followingId,
        senderId: followerId
      }
    });

    return { success: true, message: 'Successfully followed user', data: follow };
  } catch (error) {
    console.error('Follow user error:', error);
    return { success: false, message: 'Failed to follow user' };
  }
};

export const unfollowUser = async (followerId: string, followingId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if follow relationship exists
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (!follow) {
      return { success: false, message: 'Not following this user' };
    }

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        id: follow.id
      }
    });

    return { success: true, message: 'Successfully unfollowed user' };
  } catch (error) {
    console.error('Unfollow user error:', error);
    return { success: false, message: 'Failed to unfollow user' };
  }
};

export const removeFollower = async (userId: string, followerId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if follow relationship exists
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId
        }
      }
    });

    if (!follow) {
      return { success: false, message: 'User is not following you' };
    }

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        id: follow.id
      }
    });

    return { success: true, message: 'Successfully removed follower' };
  } catch (error) {
    console.error('Remove follower error:', error);
    return { success: false, message: 'Failed to remove follower' };
  }
};

export const getFollowers = async (userId: string, page: number = 1, limit: number = 10): Promise<{ success: boolean; message: string; data?: any; hasMore: boolean }> => {
  try {
    const skip = (page - 1) * limit;

    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            verificationLevel: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit + 1
    });

    const hasMore = followers.length > limit;
    const followersToReturn = hasMore ? followers.slice(0, limit) : followers;

    return {
      success: true,
      message: 'Followers retrieved successfully',
      data: followersToReturn.map(f => f.follower),
      hasMore
    };
  } catch (error) {
    console.error('Get followers error:', error);
    return {
      success: false,
      message: 'Failed to get followers',
      hasMore: false
    };
  }
};

export const getFollowing = async (userId: string, page: number = 1, limit: number = 10): Promise<{ success: boolean; message: string; data?: any; hasMore: boolean }> => {
  try {
    const skip = (page - 1) * limit;

    const following = await prisma.follow.findMany({
      where: {
        followerId: userId
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            verificationLevel: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit + 1
    });

    const hasMore = following.length > limit;
    const followingToReturn = hasMore ? following.slice(0, limit) : following;

    return {
      success: true,
      message: 'Following retrieved successfully',
      data: followingToReturn.map(f => f.following),
      hasMore
    };
  } catch (error) {
    console.error('Get following error:', error);
    return {
      success: false,
      message: 'Failed to get following',
      hasMore: false
    };
  }
};

// Messaging functions
export const sendMessage = async (userId: string, data: {
  chatId: string;
  content: string;
  receiverId: string;
  fileUrl?: string;
}): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    // Check if user is a participant in the chat
    const chatParticipant = await prisma.chatParticipant.findFirst({
      where: {
        chatId: data.chatId,
        userId: userId
      }
    });

    if (!chatParticipant) {
      return { success: false, message: 'You are not a participant in this chat' };
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content: data.content,
        chatId: data.chatId,
        senderId: userId,
        receiverId: data.receiverId,
        chatFile: data.fileUrl ? {
          create: {
            fileUrl: data.fileUrl,
            chatId: data.chatId
          }
        } : undefined
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            }
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            }
          }
        },
        chatFile: true
      }
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        type: 'MESSAGE',
        message: `You have received a ${data.fileUrl ? 'file' : 'message'}`,
        receiverId: data.receiverId,
        senderId: userId,
        entityId: message.id,
        entityType: 'MESSAGE'
      }
    });

    return { success: true, message: 'Message sent successfully', data: message };
  } catch (error) {
    console.error('Send message error:', error);
    return { success: false, message: 'Failed to send message' };
  }
};

export const getChatHistory = async (userId: string, chatId: string, page: number = 1, limit: number = 20): Promise<{ 
  success: boolean; 
  message: string; 
  data?: any;
  hasMore: boolean;
}> => {
  try {
    // Check if user is a participant in the chat
    const chatParticipant = await prisma.chatParticipant.findFirst({
      where: {
        chatId: chatId,
        userId: userId
      }
    });

    if (!chatParticipant) {
      return { success: false, message: 'You are not a participant in this chat', hasMore: false };
    }

    const skip = (page - 1) * limit;

    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            }
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                profilePictureUrl: true
              }
            }
          }
        },
        chatFile: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit + 1
    });

    const hasMore = messages.length > limit;
    const messagesToReturn = hasMore ? messages.slice(0, limit) : messages;

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        chatId: chatId,
        receiverId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return {
      success: true,
      message: 'Chat history retrieved successfully',
      data: messagesToReturn.reverse(), // Return in chronological order
      hasMore
    };
  } catch (error) {
    console.error('Get chat history error:', error);
    return { success: false, message: 'Failed to get chat history', hasMore: false };
  }
};

export const getUserChats = async (userId: string, page: number = 1, limit: number = 10): Promise<{ 
  success: boolean; 
  message: string; 
  data?: any;
  hasMore: boolean;
}> => {
  try {
    const skip = (page - 1) * limit;

    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profile: {
                  select: {
                    profilePictureUrl: true
                  }
                }
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                receiverId: userId,
                isRead: false
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip,
      take: limit + 1
    });

    const hasMore = chats.length > limit;
    const chatsToReturn = hasMore ? chats.slice(0, limit) : chats;

    return {
      success: true,
      message: 'User chats retrieved successfully',
      data: chatsToReturn,
      hasMore
    };
  } catch (error) {
    console.error('Get user chats error:', error);
    return { success: false, message: 'Failed to get user chats', hasMore: false };
  }
};
