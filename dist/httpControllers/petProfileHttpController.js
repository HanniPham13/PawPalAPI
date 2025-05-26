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
exports.handleDeletePetProfile = exports.handleGetUserPetProfiles = exports.handleUpdatePetProfile = exports.handleCreatePetProfile = void 0;
const petProfileFunctionController = __importStar(require("../functionControllers/petProfileFunctionController"));
const handleCreatePetProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const petProfile = yield petProfileFunctionController.createPetProfile(userId, req.body);
        res.status(201).json({
            success: true,
            message: 'Pet profile created successfully',
            data: petProfile
        });
    }
    catch (error) {
        console.error('Create pet profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to create pet profile' });
    }
});
exports.handleCreatePetProfile = handleCreatePetProfile;
const handleUpdatePetProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { petId } = req.params;
        const updatedProfile = yield petProfileFunctionController.updatePetProfile(userId, petId, req.body);
        if (!updatedProfile) {
            res.status(404).json({ success: false, message: 'Pet profile not found' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Pet profile updated successfully',
            data: updatedProfile
        });
    }
    catch (error) {
        console.error('Update pet profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to update pet profile' });
    }
});
exports.handleUpdatePetProfile = handleUpdatePetProfile;
const handleGetUserPetProfiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const petProfiles = yield petProfileFunctionController.getUserPetProfiles(userId);
        res.status(200).json({
            success: true,
            message: 'Pet profiles retrieved successfully',
            data: petProfiles
        });
    }
    catch (error) {
        console.error('Get user pet profiles error:', error);
        res.status(500).json({ success: false, message: 'Failed to get pet profiles' });
    }
});
exports.handleGetUserPetProfiles = handleGetUserPetProfiles;
const handleDeletePetProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { petId } = req.params;
        const deleted = yield petProfileFunctionController.deletePetProfile(userId, petId);
        if (!deleted) {
            res.status(404).json({ success: false, message: 'Pet profile not found' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Pet profile deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete pet profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete pet profile' });
    }
});
exports.handleDeletePetProfile = handleDeletePetProfile;
