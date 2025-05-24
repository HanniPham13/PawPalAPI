import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import {
  createPetProfileHandler,
  updatePetProfileHandler,
  getUserPetsHandler,
  getPetProfileHandler,
  deletePetProfileHandler
} from '../httpControllers/petProfileHttpController';

const router = express.Router();
const upload = multer();

// Create a new pet profile
router.post(
  '/profile',
  authenticateToken,
  upload.single('profilePicture'),
  createPetProfileHandler
);

// Update a pet profile
router.put(
  '/profile/:id',
  authenticateToken,
  upload.single('profilePicture'),
  updatePetProfileHandler
);

// Get all pets for the authenticated user
router.get(
  '/profiles',
  authenticateToken,
  getUserPetsHandler
);

// Get a specific pet profile
router.get(
  '/profile/:id',
  authenticateToken,
  getPetProfileHandler
);

// Delete a pet profile
router.delete(
  '/profile/:id',
  authenticateToken,
  deletePetProfileHandler
);

export default router; 