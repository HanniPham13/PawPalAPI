"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserChats = exports.getChatHistory = exports.sendMessage = exports.getFollowing = exports.getFollowers = exports.removeFollower = exports.unfollowUser = exports.followUser = exports.getSavedPosts = exports.toggleSavePost = exports.toggleFavorite = exports.deleteComment = exports.addComment = exports.addReaction = exports.getFeedPosts = exports.loginUser = exports.resetPassword = exports.initiatePasswordReset = exports.resendVerificationEmail = exports.verifyEmail = exports.registerUser = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const emailService_1 = require("../services/emailService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const registerUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if email is already in use
        const existingUserByEmail = yield prisma.user.findUnique({
            where: { email: userData.email }
        });
        // If email exists but is not verified, resend verification
        if (existingUserByEmail && !existingUserByEmail.isVerified) {
            const resendResult = yield (0, exports.resendVerificationEmail)(userData.email);
            return {
                success: true,
                message: 'This email is registered but not verified. We have sent a new verification email.'
            };
        }
        // Check if username is already taken
        const existingUserByUsername = yield prisma.user.findUnique({
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
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(userData.password, salt);
        // Generate verification code - 6 digit numeric code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Create user with optional address
        const newUser = yield prisma.user.create({
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
        yield (0, emailService_1.sendVerificationEmail)(newUser, verificationCode);
        // Return user without sensitive information
        const { password, verificationCode: code } = newUser, userWithoutSensitiveInfo = __rest(newUser, ["password", "verificationCode"]);
        return {
            success: true,
            message: 'User registered successfully! Please check your email to verify your account.',
            user: userWithoutSensitiveInfo
        };
    }
    catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            message: 'An error occurred during registration'
        };
    }
});
exports.registerUser = registerUser;
const verifyEmail = (email, code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({
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
        yield prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                isEmailVerified: true,
                verificationCode: null
            }
        });
        return { success: true, message: 'Email verified successfully' };
    }
    catch (error) {
        console.error('Verification error:', error);
        return { success: false, message: 'An error occurred during verification' };
    }
});
exports.verifyEmail = verifyEmail;
const resendVerificationEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({
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
        yield prisma.user.update({
            where: { id: user.id },
            data: { verificationCode }
        });
        // Send new verification email
        yield (0, emailService_1.sendVerificationEmail)(user, verificationCode);
        return { success: true, message: 'Verification email sent successfully' };
    }
    catch (error) {
        console.error('Resend verification error:', error);
        return { success: false, message: 'An error occurred while resending verification email' };
    }
});
exports.resendVerificationEmail = resendVerificationEmail;
const initiatePasswordReset = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
        // Update user with reset token
        yield prisma.user.update({
            where: { id: user.id },
            data: {
                verificationCode: resetToken,
                updatedAt: new Date()
            }
        });
        // Send password reset email
        yield (0, emailService_1.sendPasswordResetEmail)(user, resetToken);
        return { success: true, message: 'Password reset instructions sent to your email' };
    }
    catch (error) {
        console.error('Password reset initiation error:', error);
        return { success: false, message: 'An error occurred while processing password reset' };
    }
});
exports.initiatePasswordReset = initiatePasswordReset;
const resetPassword = (email, resetToken, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        if (user.verificationCode !== resetToken) {
            return { success: false, message: 'Invalid or expired reset token' };
        }
        // Hash new password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, salt);
        // Update user with new password and clear reset token
        yield prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                verificationCode: null
            }
        });
        return { success: true, message: 'Password reset successful' };
    }
    catch (error) {
        console.error('Password reset error:', error);
        return { success: false, message: 'An error occurred while resetting password' };
    }
});
exports.resetPassword = resetPassword;
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the user by email
        const user = yield prisma.user.findUnique({
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
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return {
                success: false,
                message: 'Invalid credentials'
            };
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
        // Return user data without password
        const { password: _, verificationCode: __ } = user, userWithoutSensitiveInfo = __rest(user, ["password", "verificationCode"]);
        return {
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutSensitiveInfo
        };
    }
    catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'An error occurred during login'
        };
    }
});
exports.loginUser = loginUser;
const getFeedPosts = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        // Get all posts with their engagement metrics
        const posts = yield prisma.socialPost.findMany({
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
                },
                comments: {
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
                    },
                    orderBy: {
                        createdAt: 'desc'
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
            return Object.assign(Object.assign({}, post), { engagementScore: finalScore, isVerified,
                isFollowing });
        });
        // Sort by final engagement score
        postsWithScore.sort((a, b) => b.engagementScore - a.engagementScore);
        return {
            success: true,
            message: 'Feed posts retrieved successfully',
            data: postsWithScore,
            hasMore
        };
    }
    catch (error) {
        console.error('Feed posts error:', error);
        return {
            success: false,
            message: 'An error occurred while fetching feed posts',
            hasMore: false
        };
    }
});
exports.getFeedPosts = getFeedPosts;
// Reaction functions
const addReaction = (userId, postId, reactionType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if post exists
        const post = yield prisma.socialPost.findUnique({
            where: { id: postId }
        });
        if (!post) {
            return { success: false, message: 'Post not found' };
        }
        // Check if user already reacted
        const existingReaction = yield prisma.reaction.findUnique({
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
                yield prisma.reaction.delete({
                    where: {
                        id: existingReaction.id
                    }
                });
                return { success: true, message: 'Reaction removed' };
            }
            // If different reaction type, update it
            const updatedReaction = yield prisma.reaction.update({
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
        const reaction = yield prisma.reaction.create({
            data: {
                type: reactionType,
                postId,
                userId
            }
        });
        return { success: true, message: 'Reaction added', data: reaction };
    }
    catch (error) {
        console.error('Add reaction error:', error);
        return { success: false, message: 'Failed to add reaction' };
    }
});
exports.addReaction = addReaction;
// Comment functions
const addComment = (userId, postId, content, parentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if post exists
        const post = yield prisma.socialPost.findUnique({
            where: { id: postId }
        });
        if (!post) {
            return { success: false, message: 'Post not found' };
        }
        // If parentId is provided, check if parent comment exists
        if (parentId) {
            const parentComment = yield prisma.comment.findUnique({
                where: { id: parentId }
            });
            if (!parentComment) {
                return { success: false, message: 'Parent comment not found' };
            }
        }
        const comment = yield prisma.comment.create({
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
    }
    catch (error) {
        console.error('Add comment error:', error);
        return { success: false, message: 'Failed to add comment' };
    }
});
exports.addComment = addComment;
const deleteComment = (userId, commentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if comment exists and belongs to user
        const comment = yield prisma.comment.findFirst({
            where: {
                id: commentId,
                authorId: userId
            }
        });
        if (!comment) {
            return { success: false, message: 'Comment not found or you don\'t have permission to delete it' };
        }
        yield prisma.comment.delete({
            where: { id: commentId }
        });
        return { success: true, message: 'Comment deleted successfully' };
    }
    catch (error) {
        console.error('Delete comment error:', error);
        return { success: false, message: 'Failed to delete comment' };
    }
});
exports.deleteComment = deleteComment;
// Favorite functions
const toggleFavorite = (userId, postId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if post exists
        const post = yield prisma.socialPost.findUnique({
            where: { id: postId }
        });
        if (!post) {
            return { success: false, message: 'Post not found' };
        }
        // Check if already favorited
        const existingFavorite = yield prisma.favorite.findFirst({
            where: {
                userId,
                socialPostId: postId
            }
        });
        if (existingFavorite) {
            // Remove favorite
            yield prisma.favorite.delete({
                where: { id: existingFavorite.id }
            });
            return { success: true, message: 'Post removed from favorites' };
        }
        // Add favorite
        const favorite = yield prisma.favorite.create({
            data: {
                userId,
                socialPostId: postId
            }
        });
        return { success: true, message: 'Post added to favorites', data: favorite };
    }
    catch (error) {
        console.error('Toggle favorite error:', error);
        return { success: false, message: 'Failed to toggle favorite' };
    }
});
exports.toggleFavorite = toggleFavorite;
// Save post functions
const toggleSavePost = (userId, postId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if post exists
        const post = yield prisma.socialPost.findUnique({
            where: { id: postId }
        });
        if (!post) {
            return { success: false, message: 'Post not found' };
        }
        // Check if already saved
        const existingSave = yield prisma.savedPost.findFirst({
            where: {
                userId,
                postId
            }
        });
        if (existingSave) {
            // Remove save
            yield prisma.savedPost.delete({
                where: { id: existingSave.id }
            });
            return { success: true, message: 'Post removed from saved' };
        }
        // Add save
        const savedPost = yield prisma.savedPost.create({
            data: {
                userId,
                postId
            }
        });
        return { success: true, message: 'Post saved', data: savedPost };
    }
    catch (error) {
        console.error('Toggle save post error:', error);
        return { success: false, message: 'Failed to toggle save post' };
    }
});
exports.toggleSavePost = toggleSavePost;
const getSavedPosts = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const savedPosts = yield prisma.savedPost.findMany({
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
    }
    catch (error) {
        console.error('Get saved posts error:', error);
        return {
            success: false,
            message: 'Failed to get saved posts',
            hasMore: false
        };
    }
});
exports.getSavedPosts = getSavedPosts;
// Follow functions
const followUser = (followerId, followingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if trying to follow self
        if (followerId === followingId) {
            return { success: false, message: 'Cannot follow yourself' };
        }
        // Check if user to follow exists
        const userToFollow = yield prisma.user.findUnique({
            where: { id: followingId }
        });
        if (!userToFollow) {
            return { success: false, message: 'User to follow not found' };
        }
        // Check if already following
        const existingFollow = yield prisma.follow.findUnique({
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
        const follow = yield prisma.follow.create({
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
        yield prisma.notification.create({
            data: {
                type: 'FOLLOW',
                message: `${follow.follower.username} started following you`,
                receiverId: followingId,
                senderId: followerId
            }
        });
        return { success: true, message: 'Successfully followed user', data: follow };
    }
    catch (error) {
        console.error('Follow user error:', error);
        return { success: false, message: 'Failed to follow user' };
    }
});
exports.followUser = followUser;
const unfollowUser = (followerId, followingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if follow relationship exists
        const follow = yield prisma.follow.findUnique({
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
        yield prisma.follow.delete({
            where: {
                id: follow.id
            }
        });
        return { success: true, message: 'Successfully unfollowed user' };
    }
    catch (error) {
        console.error('Unfollow user error:', error);
        return { success: false, message: 'Failed to unfollow user' };
    }
});
exports.unfollowUser = unfollowUser;
const removeFollower = (userId, followerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if follow relationship exists
        const follow = yield prisma.follow.findUnique({
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
        yield prisma.follow.delete({
            where: {
                id: follow.id
            }
        });
        return { success: true, message: 'Successfully removed follower' };
    }
    catch (error) {
        console.error('Remove follower error:', error);
        return { success: false, message: 'Failed to remove follower' };
    }
});
exports.removeFollower = removeFollower;
const getFollowers = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const followers = yield prisma.follow.findMany({
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
    }
    catch (error) {
        console.error('Get followers error:', error);
        return {
            success: false,
            message: 'Failed to get followers',
            hasMore: false
        };
    }
});
exports.getFollowers = getFollowers;
const getFollowing = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const following = yield prisma.follow.findMany({
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
    }
    catch (error) {
        console.error('Get following error:', error);
        return {
            success: false,
            message: 'Failed to get following',
            hasMore: false
        };
    }
});
exports.getFollowing = getFollowing;
// Messaging functions
const sendMessage = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user is a participant in the chat
        const chatParticipant = yield prisma.chatParticipant.findFirst({
            where: {
                chatId: data.chatId,
                userId: userId
            }
        });
        if (!chatParticipant) {
            return { success: false, message: 'You are not a participant in this chat' };
        }
        // Create the message
        const message = yield prisma.message.create({
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
        yield prisma.notification.create({
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
    }
    catch (error) {
        console.error('Send message error:', error);
        return { success: false, message: 'Failed to send message' };
    }
});
exports.sendMessage = sendMessage;
const getChatHistory = (userId_1, chatId_1, ...args_1) => __awaiter(void 0, [userId_1, chatId_1, ...args_1], void 0, function* (userId, chatId, page = 1, limit = 20) {
    try {
        // Check if user is a participant in the chat
        const chatParticipant = yield prisma.chatParticipant.findFirst({
            where: {
                chatId: chatId,
                userId: userId
            }
        });
        if (!chatParticipant) {
            return { success: false, message: 'You are not a participant in this chat', hasMore: false };
        }
        const skip = (page - 1) * limit;
        const messages = yield prisma.message.findMany({
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
        yield prisma.message.updateMany({
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
    }
    catch (error) {
        console.error('Get chat history error:', error);
        return { success: false, message: 'Failed to get chat history', hasMore: false };
    }
});
exports.getChatHistory = getChatHistory;
const getUserChats = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const chats = yield prisma.chat.findMany({
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
    }
    catch (error) {
        console.error('Get user chats error:', error);
        return { success: false, message: 'Failed to get user chats', hasMore: false };
    }
});
exports.getUserChats = getUserChats;
