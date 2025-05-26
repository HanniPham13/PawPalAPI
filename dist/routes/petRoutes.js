"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const petHttpController_1 = require("../httpControllers/petHttpController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const fileHandler_1 = require("../middlewares/fileHandler");
const router = (0, express_1.Router)();
// Pet profile routes
router.post('/profile', authMiddleware_1.authenticate, fileHandler_1.upload.single('profilePicture'), petHttpController_1.handleCreatePetProfile);
router.get('/profile/:petId', petHttpController_1.handleGetPetProfile);
router.put('/profile/:petId', authMiddleware_1.authenticate, fileHandler_1.upload.single('profilePicture'), petHttpController_1.handleUpdatePetProfile);
router.delete('/profile/:petId', authMiddleware_1.authenticate, petHttpController_1.handleDeletePetProfile);
// Get all pets for a user
router.get('/user-pets', authMiddleware_1.authenticate, petHttpController_1.handleGetUserPets);
router.get('/user-pets/:userId', petHttpController_1.handleGetUserPets);
// Toggle adoptable status
router.patch('/profile/:petId/toggle-adoptable', authMiddleware_1.authenticate, petHttpController_1.handleToggleAdoptableStatus);
// Medical record routes
router.post('/profile/:petId/medical', authMiddleware_1.authenticate, fileHandler_1.upload.single('medicalDocument'), petHttpController_1.handleAddMedicalRecord);
router.get('/profile/:petId/medical', petHttpController_1.handleGetMedicalRecords);
router.get('/profile/:petId/medical/:recordId', petHttpController_1.handleGetMedicalRecord);
router.put('/profile/:petId/medical/:recordId', authMiddleware_1.authenticate, fileHandler_1.upload.single('medicalDocument'), petHttpController_1.handleUpdateMedicalRecord);
router.delete('/profile/:petId/medical/:recordId', authMiddleware_1.authenticate, petHttpController_1.handleDeleteMedicalRecord);
exports.default = router;
