import express from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
  handleCreatePetProfile,
  handleUpdatePetProfile,
  handleGetUserPetProfiles,
  handleDeletePetProfile
} from '../httpControllers/petProfileHttpController';

const router = express.Router();

// Create a new pet profile
router.post(
  '/profile',
  authenticate,
  handleCreatePetProfile
);

// Update a pet profile
router.put(
  '/profile/:petId',
  authenticate,
  handleUpdatePetProfile
);

// Get all pets for the authenticated user
router.get(
  '/profiles',
  authenticate,
  handleGetUserPetProfiles
);

// Delete a pet profile
router.delete(
  '/profile/:petId',
  authenticate,
  handleDeletePetProfile
);

export default router; 