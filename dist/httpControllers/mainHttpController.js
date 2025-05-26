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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetUserChats = exports.handleGetChatHistory = exports.handleSendMessage = exports.handleGetFollowing = exports.handleGetFollowers = exports.handleRemoveFollower = exports.handleUnfollowUser = exports.handleFollowUser = exports.handleGetSavedPosts = exports.handleToggleSavePost = exports.handleToggleFavorite = exports.handleDeleteComment = exports.handleAddComment = exports.handleAddReaction = exports.handleGetFeedPosts = exports.handleResetPassword = exports.handleRequestPasswordReset = exports.handleResendVerification = exports.handleVerifyEmail = exports.handleLogin = exports.handleRegister = void 0;
const mainFunctionController_1 = require("../functionControllers/mainFunctionController");
const handleRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield (0, mainFunctionController_1.registerUser)({ email, username, password, firstName, lastName, address });
    if (result.success) {
        res.status(201).json(result);
    }
    else {
        res.status(400).json(result);
    }
});
exports.handleRegister = handleRegister;
const handleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield (0, mainFunctionController_1.loginUser)(email, password);
    if (result.success) {
        res.status(200).json(result);
    }
    else {
        res.status(401).json(result);
    }
});
exports.handleLogin = handleLogin;
const handleVerifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        res.status(400).json({ success: false, message: 'Request body is required' });
        return;
    }
    const { email, code } = req.body;
    if (!email || !code) {
        res.status(400).json({ success: false, message: 'Email and verification code are required' });
        return;
    }
    const result = yield (0, mainFunctionController_1.verifyEmail)(email, code);
    if (result.success) {
        res.status(200).json(result);
    }
    else {
        res.status(400).json(result);
    }
});
exports.handleVerifyEmail = handleVerifyEmail;
const handleResendVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        res.status(400).json({ success: false, message: 'Request body is required' });
        return;
    }
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ success: false, message: 'Email is required' });
        return;
    }
    const result = yield (0, mainFunctionController_1.resendVerificationEmail)(email);
    if (result.success) {
        res.status(200).json(result);
    }
    else {
        res.status(400).json(result);
    }
});
exports.handleResendVerification = handleResendVerification;
const handleRequestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        res.status(400).json({ success: false, message: 'Request body is required' });
        return;
    }
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ success: false, message: 'Email is required' });
        return;
    }
    const result = yield (0, mainFunctionController_1.initiatePasswordReset)(email);
    if (result.success) {
        res.status(200).json(result);
    }
    else {
        res.status(400).json(result);
    }
});
exports.handleRequestPasswordReset = handleRequestPasswordReset;
const handleResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield (0, mainFunctionController_1.resetPassword)(email, token, newPassword);
    if (result.success) {
        res.status(200).json(result);
    }
    else {
        res.status(400).json(result);
    }
});
exports.handleResetPassword = handleResetPassword;
const handleGetFeedPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (page < 1 || limit < 1) {
            res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
            return;
        }
        const result = yield (0, mainFunctionController_1.getFeedPosts)(userId, page, limit);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to fetch feed posts' });
    }
});
exports.handleGetFeedPosts = handleGetFeedPosts;
// Reaction endpoints
const handleAddReaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { postId, reactionType } = req.body;
        if (!postId || !reactionType) {
            res.status(400).json({ success: false, message: 'Post ID and reaction type are required' });
            return;
        }
        const result = yield (0, mainFunctionController_1.addReaction)(userId, postId, reactionType);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to add reaction' });
    }
});
exports.handleAddReaction = handleAddReaction;
// Comment endpoints
const handleAddComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { postId, content, parentId } = req.body;
        if (!postId || !content) {
            res.status(400).json({ success: false, message: 'Post ID and content are required' });
            return;
        }
        const result = yield (0, mainFunctionController_1.addComment)(userId, postId, content, parentId);
        if (result.success) {
            res.status(201).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
});
exports.handleAddComment = handleAddComment;
const handleDeleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { commentId } = req.params;
        if (!commentId) {
            res.status(400).json({ success: false, message: 'Comment ID is required' });
            return;
        }
        const result = yield (0, mainFunctionController_1.deleteComment)(userId, commentId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to delete comment' });
    }
});
exports.handleDeleteComment = handleDeleteComment;
// Favorite endpoints
const handleToggleFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { postId } = req.body;
        if (!postId) {
            res.status(400).json({ success: false, message: 'Post ID is required' });
            return;
        }
        const result = yield (0, mainFunctionController_1.toggleFavorite)(userId, postId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to toggle favorite' });
    }
});
exports.handleToggleFavorite = handleToggleFavorite;
// Save post endpoints
const handleToggleSavePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { postId } = req.body;
        if (!postId) {
            res.status(400).json({ success: false, message: 'Post ID is required' });
            return;
        }
        const result = yield (0, mainFunctionController_1.toggleSavePost)(userId, postId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to toggle save post' });
    }
});
exports.handleToggleSavePost = handleToggleSavePost;
const handleGetSavedPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (page < 1 || limit < 1) {
            res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
            return;
        }
        const result = yield (0, mainFunctionController_1.getSavedPosts)(userId, page, limit);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to get saved posts' });
    }
});
exports.handleGetSavedPosts = handleGetSavedPosts;
// Follow endpoints
const handleFollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { followingId } = req.body;
        if (!followingId) {
            res.status(400).json({ success: false, message: 'User ID to follow is required' });
            return;
        }
        const result = yield (0, mainFunctionController_1.followUser)(userId, followingId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to follow user' });
    }
});
exports.handleFollowUser = handleFollowUser;
const handleUnfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { followingId } = req.body;
        if (!followingId) {
            res.status(400).json({ success: false, message: 'User ID to unfollow is required' });
            return;
        }
        const result = yield (0, mainFunctionController_1.unfollowUser)(userId, followingId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to unfollow user' });
    }
});
exports.handleUnfollowUser = handleUnfollowUser;
const handleRemoveFollower = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { followerId } = req.body;
        if (!followerId) {
            res.status(400).json({ success: false, message: 'Follower ID is required' });
            return;
        }
        const result = yield (0, mainFunctionController_1.removeFollower)(userId, followerId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to remove follower' });
    }
});
exports.handleRemoveFollower = handleRemoveFollower;
const handleGetFollowers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (page < 1 || limit < 1) {
            res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
            return;
        }
        const result = yield (0, mainFunctionController_1.getFollowers)(userId, page, limit);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to get followers' });
    }
});
exports.handleGetFollowers = handleGetFollowers;
const handleGetFollowing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (page < 1 || limit < 1) {
            res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
            return;
        }
        const result = yield (0, mainFunctionController_1.getFollowing)(userId, page, limit);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to get following' });
    }
});
exports.handleGetFollowing = handleGetFollowing;
// Messaging endpoints
const handleSendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { chatId, content, receiverId } = req.body;
        const file = req.file;
        if (!chatId || (!content && !file) || !receiverId) {
            res.status(400).json({ success: false, message: 'Chat ID, content or file, and receiver ID are required' });
            return;
        }
        const result = yield (0, mainFunctionController_1.sendMessage)(userId, {
            chatId,
            content: content || '',
            receiverId,
            fileUrl: file ? file.path : undefined
        });
        if (result.success) {
            res.status(201).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});
exports.handleSendMessage = handleSendMessage;
const handleGetChatHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { chatId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        if (!chatId) {
            res.status(400).json({ success: false, message: 'Chat ID is required' });
            return;
        }
        if (page < 1 || limit < 1) {
            res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
            return;
        }
        const result = yield (0, mainFunctionController_1.getChatHistory)(userId, chatId, page, limit);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to get chat history' });
    }
});
exports.handleGetChatHistory = handleGetChatHistory;
const handleGetUserChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (page < 1 || limit < 1) {
            res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
            return;
        }
        const result = yield (0, mainFunctionController_1.getUserChats)(userId, page, limit);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to get user chats' });
    }
});
exports.handleGetUserChats = handleGetUserChats;
