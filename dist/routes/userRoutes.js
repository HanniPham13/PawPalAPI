"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const fileHandler_1 = require("../middlewares/fileHandler");
const userHttpController = __importStar(require("../httpControllers/userHttpController"));
const index_1 = require("../index");
const router = (0, express_1.Router)();
// Get current user profile - temporary direct implementation 
router.get('/profile', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        // Get the user with their profile
        const user = yield index_1.prisma.user.findUnique({
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
        const { password } = user, userData = __rest(user, ["password"]);
        res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            data: userData
        });
    }
    catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve user profile' });
    }
}));
// Get any user's profile by ID
router.get('/profile/:userId', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Get the user with their profile
        const user = yield index_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                coverPicture: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        petProfiles: true
                    }
                }
            }
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        // Extract password and other sensitive fields
        const { password, email } = user, userData = __rest(user, ["password", "email"]);
        // Swap follower and following counts if _count exists
        if (userData._count) {
            const tempFollowers = userData._count.followers;
            userData._count.followers = userData._count.following;
            userData._count.following = tempFollowers;
        }
        res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            data: userData
        });
    }
    catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve user profile' });
    }
}));
// Profile picture routes
router.post('/profile-picture', authMiddleware_1.authenticate, fileHandler_1.upload.single('profilePicture'), userHttpController.handleUploadProfilePicture);
router.delete('/profile-picture', authMiddleware_1.authenticate, userHttpController.handleDeleteProfilePicture);
// Cover picture routes
router.post('/cover-picture', authMiddleware_1.authenticate, fileHandler_1.upload.single('coverPicture'), userHttpController.handleUploadCoverPicture);
router.delete('/cover-picture', authMiddleware_1.authenticate, userHttpController.handleDeleteCoverPicture);
// Profile information routes
router.patch('/profile', authMiddleware_1.authenticate, userHttpController.handleUpdateProfileInfo);
// Password change route
router.post('/change-password', authMiddleware_1.authenticate, userHttpController.handleChangePassword);
// Address routes
router.put('/address', authMiddleware_1.authenticate, userHttpController.handleUpdateAddress);
// Social post routes
router.post('/posts', authMiddleware_1.authenticate, fileHandler_1.upload.array('postImage', 5), userHttpController.handleCreateSocialPost);
router.delete('/posts/:postId', authMiddleware_1.authenticate, userHttpController.handleDeleteSocialPost);
router.get('/posts/:postId', authMiddleware_1.authenticate, userHttpController.handleGetSocialPost);
// Purrparent verification route
router.post('/verify/purrparent', authMiddleware_1.authenticate, fileHandler_1.upload.array('documents', 5), userHttpController.handleApplyForPurrparentVerification);
// Pet adoption post routes
router.post('/adoption-posts', authMiddleware_1.authenticate, fileHandler_1.upload.array('rehomingImage', 5), userHttpController.handleCreatePetAdoptionPost);
router.get('/adoption-posts', authMiddleware_1.authenticate, userHttpController.handleGetUserAdoptionPosts);
router.get('/adoption-feed', authMiddleware_1.authenticate, userHttpController.handleGetAllAdoptionPosts);
router.delete('/adoption-posts/:postId', authMiddleware_1.authenticate, userHttpController.handleDeletePetAdoptionPost);
// Pet adoption application routes
router.post('/adoption-applications', authMiddleware_1.authenticate, userHttpController.handleApplyForAdoption);
router.get('/adoption-applications', authMiddleware_1.authenticate, userHttpController.handleGetMyAdoptionApplications);
router.get('/adoption-applications/received', authMiddleware_1.authenticate, userHttpController.handleGetReceivedAdoptionApplications);
router.put('/adoption-applications/:applicationId/approve', authMiddleware_1.authenticate, userHttpController.handleApproveAdoptionApplication);
router.put('/adoption-applications/:applicationId/reject', authMiddleware_1.authenticate, userHttpController.handleRejectAdoptionApplication);
exports.default = router;
