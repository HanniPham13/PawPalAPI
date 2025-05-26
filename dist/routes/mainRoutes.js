"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mainHttpController_1 = require("../httpControllers/mainHttpController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const fileHandler_1 = require("../middlewares/fileHandler");
const router = (0, express_1.Router)();
// Authentication routes
router.post('/register', mainHttpController_1.handleRegister);
router.post('/login', mainHttpController_1.handleLogin);
router.post('/verify-email', mainHttpController_1.handleVerifyEmail);
router.post('/resend-verification', mainHttpController_1.handleResendVerification);
router.post('/forgot-password', mainHttpController_1.handleRequestPasswordReset);
router.post('/reset-password', mainHttpController_1.handleResetPassword);
// Feed routes
router.get('/feed', authMiddleware_1.authenticate, mainHttpController_1.handleGetFeedPosts);
// Interaction routes
router.post('/reactions', authMiddleware_1.authenticate, mainHttpController_1.handleAddReaction);
router.post('/comments', authMiddleware_1.authenticate, mainHttpController_1.handleAddComment);
router.delete('/comments/:commentId', authMiddleware_1.authenticate, mainHttpController_1.handleDeleteComment);
router.post('/favorites', authMiddleware_1.authenticate, mainHttpController_1.handleToggleFavorite);
router.post('/save', authMiddleware_1.authenticate, mainHttpController_1.handleToggleSavePost);
router.get('/saved', authMiddleware_1.authenticate, mainHttpController_1.handleGetSavedPosts);
// Follow routes
router.post('/follow', authMiddleware_1.authenticate, mainHttpController_1.handleFollowUser);
router.post('/unfollow', authMiddleware_1.authenticate, mainHttpController_1.handleUnfollowUser);
router.post('/remove-follower', authMiddleware_1.authenticate, mainHttpController_1.handleRemoveFollower);
router.get('/followers', authMiddleware_1.authenticate, mainHttpController_1.handleGetFollowers);
router.get('/following', authMiddleware_1.authenticate, mainHttpController_1.handleGetFollowing);
// Messaging routes
router.post('/messages', authMiddleware_1.authenticate, fileHandler_1.upload.single('chatFile'), mainHttpController_1.handleSendMessage);
router.get('/chats/:chatId/messages', authMiddleware_1.authenticate, mainHttpController_1.handleGetChatHistory);
router.get('/chats', authMiddleware_1.authenticate, mainHttpController_1.handleGetUserChats);
exports.default = router;
