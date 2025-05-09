import { Router } from 'express';
import { 
  handleCreatePetProfile, 
  handleGetPetProfile,
  handleUpdatePetProfile,
  handleDeletePetProfile,
  handleGetUserPets,
  handleToggleAdoptableStatus,
  handleAddMedicalRecord,
  handleUpdateMedicalRecord,
  handleDeleteMedicalRecord,
  handleGetMedicalRecords,
  handleGetMedicalRecord
} from '../httpControllers/petHttpController';
import { authenticate } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/fileHandler';

const router = Router();

// Pet profile routes
router.post('/profile', authenticate, upload.single('profilePicture'), handleCreatePetProfile);
router.get('/profile/:petId', handleGetPetProfile);
router.put('/profile/:petId', authenticate, upload.single('profilePicture'), handleUpdatePetProfile);
router.delete('/profile/:petId', authenticate, handleDeletePetProfile);

// Get all pets for a user
router.get('/user-pets', authenticate, handleGetUserPets);
router.get('/user-pets/:userId', handleGetUserPets);

// Toggle adoptable status
router.patch('/profile/:petId/toggle-adoptable', authenticate, handleToggleAdoptableStatus);

// Medical record routes
router.post('/profile/:petId/medical', authenticate, upload.single('medicalDocument'), handleAddMedicalRecord);
router.get('/profile/:petId/medical', handleGetMedicalRecords);
router.get('/profile/:petId/medical/:recordId', handleGetMedicalRecord);
router.put('/profile/:petId/medical/:recordId', authenticate, upload.single('medicalDocument'), handleUpdateMedicalRecord);
router.delete('/profile/:petId/medical/:recordId', authenticate, handleDeleteMedicalRecord);

export default router;
