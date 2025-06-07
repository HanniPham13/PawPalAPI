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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetAllAdoptionPosts = exports.handleRejectAdoptionApplication = exports.handleApproveAdoptionApplication = exports.handleUpdateAdoptionApplicationStatus = exports.handleGetReceivedAdoptionApplications = exports.handleGetMyAdoptionApplications = exports.handleApplyForAdoption = exports.handleDeletePetAdoptionPost = exports.handleGetUserAdoptionPosts = exports.handleCreatePetAdoptionPost = exports.handleApplyForPurrparentVerification = exports.handleGetSocialPost = exports.handleDeleteSocialPost = exports.handleCreateSocialPost = exports.handleUpdateAddress = exports.handleChangePassword = exports.handleUpdateProfileInfo = exports.handleDeleteCoverPicture = exports.handleDeleteProfilePicture = exports.handleUploadCoverPicture = exports.handleUploadProfilePicture = exports.handleGetUserProfile = void 0;
const userFunctionController = __importStar(require("../functionControllers/userFunctionController"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const handleGetUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const result = yield userFunctionController.getUserProfile(userId);
        res.status(result.success ? 200 : 400).json(result);
    }
    catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve user profile' });
    }
});
exports.handleGetUserProfile = handleGetUserProfile;
const handleUploadProfilePicture = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const filePath = req.file.path.replace(/\\/g, '/');
        const result = yield userFunctionController.uploadProfilePicture(userId, filePath);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to upload profile picture' });
    }
});
exports.handleUploadProfilePicture = handleUploadProfilePicture;
const handleUploadCoverPicture = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) { 
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const filePath = req.file.path.replace(/\\/g, '/');
        const result = yield userFunctionController.uploadCoverPicture(userId, filePath);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to upload cover picture' });
    }
});
exports.handleUploadCoverPicture = handleUploadCoverPicture;
const handleDeleteProfilePicture = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const result = yield userFunctionController.deleteProfilePicture(userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete profile picture' });
    }
});
exports.handleDeleteProfilePicture = handleDeleteProfilePicture;
const handleDeleteCoverPicture = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const result = yield userFunctionController.deleteCoverPicture(userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete cover picture' });
    }
});
exports.handleDeleteCoverPicture = handleDeleteCoverPicture;
const handleUpdateProfileInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { firstName, lastName, bio, username } = req.body;
        const result = yield userFunctionController.updateProfileInfo(userId, {
            firstName,
            lastName,
            bio,
            username
        });
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to update profile information' });
    }
});
exports.handleUpdateProfileInfo = handleUpdateProfileInfo;
const handleChangePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ success: false, message: 'Current password and new password are required' });
            return;
        }
        const result = yield userFunctionController.changePassword(userId, currentPassword, newPassword);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
});
exports.handleChangePassword = handleChangePassword;
const handleUpdateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { address, city, state, zipCode } = req.body;
        if (!address || !city || !state || !zipCode) {
            res.status(400).json({ success: false, message: 'All address fields are required' });
            return;
        }
        const result = yield userFunctionController.updateAddress(userId, {
            address,
            city,
            state,
            zipCode
        });
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to update address' });
    }
});
exports.handleUpdateAddress = handleUpdateAddress;
const handleCreateSocialPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { content, taggedPetIds } = req.body;
        const images = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : undefined;
        if (!content) {
            res.status(400).json({ success: false, message: 'Content is required' });
            return;
        }
        const result = yield userFunctionController.createSocialPost(userId, {
            content,
            images,
            taggedPetIds: taggedPetIds ? JSON.parse(taggedPetIds) : undefined
        });
        res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to create social post' });
    }
});
exports.handleCreateSocialPost = handleCreateSocialPost;
const handleDeleteSocialPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { postId } = req.params;
        if (!postId) {
            res.status(400).json({ success: false, message: 'Post ID is required' });
            return;
        }
        const result = yield userFunctionController.deleteSocialPost(userId, postId);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to delete social post' });
    }
});
exports.handleDeleteSocialPost = handleDeleteSocialPost;
const handleGetSocialPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        if (!postId) {
            res.status(400).json({ success: false, message: 'Post ID is required' });
            return;
        }
        const result = yield userFunctionController.getSocialPost(postId);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to get social post' });
    }
});
exports.handleGetSocialPost = handleGetSocialPost;
const handleApplyForPurrparentVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const files = req.files;
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
            documentType: documentType,
            documentUrl: file.path.replace(/\\/g, '/')
        }));
        const result = yield userFunctionController.applyForPurrparentVerification(userId, documents);
        res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to submit verification request' });
    }
});
exports.handleApplyForPurrparentVerification = handleApplyForPurrparentVerification;
const handleCreatePetAdoptionPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { title, description, location, petProfileId } = req.body;
        const images = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : undefined;
        if (!title || !description) {
            res.status(400).json({ success: false, message: 'Title and description are required' });
            return;
        }
        const result = yield userFunctionController.createPetAdoptionPost(userId, {
            title,
            description,
            location,
            petProfileId,
            images
        });
        res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to create pet adoption post' });
    }
});
exports.handleCreatePetAdoptionPost = handleCreatePetAdoptionPost;
const handleGetUserAdoptionPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield userFunctionController.getUserAdoptionPosts(userId, page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to get adoption posts' });
    }
});
exports.handleGetUserAdoptionPosts = handleGetUserAdoptionPosts;
const handleDeletePetAdoptionPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { postId } = req.params;
        if (!postId) {
            res.status(400).json({ success: false, message: 'Post ID is required' });
            return;
        }
        const result = yield userFunctionController.deletePetAdoptionPost(userId, postId);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to delete adoption post' });
    }
});
exports.handleDeletePetAdoptionPost = handleDeletePetAdoptionPost;
const handleApplyForAdoption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { adoptionPostId, message } = req.body;
        if (!adoptionPostId || !message) {
            res.status(400).json({ success: false, message: 'Adoption post ID and message are required' });
            return;
        }
        const result = yield userFunctionController.applyForAdoption(userId, {
            adoptionPostId,
            message
        });
        res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to apply for adoption' });
    }
});
exports.handleApplyForAdoption = handleApplyForAdoption;
const handleGetMyAdoptionApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield userFunctionController.getMyAdoptionApplications(userId, page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to get adoption applications' });
    }
});
exports.handleGetMyAdoptionApplications = handleGetMyAdoptionApplications;
const handleGetReceivedAdoptionApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield userFunctionController.getReceivedAdoptionApplications(userId, page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to get received adoption applications' });
    }
});
exports.handleGetReceivedAdoptionApplications = handleGetReceivedAdoptionApplications;
const handleUpdateAdoptionApplicationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const result = yield userFunctionController.updateAdoptionApplicationStatus(userId, applicationId, {
            status: status,
            rejectionReason
        });
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to update application status' });
    }
});
exports.handleUpdateAdoptionApplicationStatus = handleUpdateAdoptionApplicationStatus;
const handleApproveAdoptionApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { applicationId } = req.params;
        if (!applicationId) {
            res.status(400).json({ success: false, message: 'Application ID is required' });
            return;
        }
        const result = yield userFunctionController.updateAdoptionApplicationStatus(userId, applicationId, {
            status: 'APPROVED'
        });
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to approve application' });
    }
});
exports.handleApproveAdoptionApplication = handleApproveAdoptionApplication;
const handleRejectAdoptionApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const result = yield userFunctionController.updateAdoptionApplicationStatus(userId, applicationId, {
            status: 'REJECTED',
            rejectionReason
        });
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to reject application' });
    }
});
exports.handleRejectAdoptionApplication = handleRejectAdoptionApplication;
const handleGetAllAdoptionPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (page < 1 || limit < 1) {
            res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
            return;
        }
        const result = yield userFunctionController.getAllAdoptionPosts(page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to get adoption posts' });
    }
});
exports.handleGetAllAdoptionPosts = handleGetAllAdoptionPosts;
