import { Router } from "express";
import { handleCreateClinic, handleGetVetClinics } from "../httpControllers/vetHttpController";
import { authenticate, vetOnly } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/fileHandler";

const router = Router();

// Clinic management routes
router.post('/clinics', 
  authenticate, 
  vetOnly, 
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverPicture', maxCount: 1 },
    { name: 'clinicImages', maxCount: 5 }
  ]), 
  handleCreateClinic
);
router.get('/clinics', authenticate, vetOnly, handleGetVetClinics);

export default router;
