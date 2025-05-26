"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const petProfileHttpController_1 = require("../httpControllers/petProfileHttpController");
const router = express_1.default.Router();
// Create a new pet profile
router.post('/profile', authMiddleware_1.authenticate, petProfileHttpController_1.handleCreatePetProfile);
// Update a pet profile
router.put('/profile/:petId', authMiddleware_1.authenticate, petProfileHttpController_1.handleUpdatePetProfile);
// Get all pets for the authenticated user
router.get('/profiles', authMiddleware_1.authenticate, petProfileHttpController_1.handleGetUserPetProfiles);
// Delete a pet profile
router.delete('/profile/:petId', authMiddleware_1.authenticate, petProfileHttpController_1.handleDeletePetProfile);
exports.default = router;
