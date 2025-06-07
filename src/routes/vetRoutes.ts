import { Router } from "express";
import {
  handleCreateClinic,
  handleGetVetClinics,
  handleUpdateClinic,
  handleDeleteClinic,
  handleGetClinicById,
  handleUpdateClinicStatus,
} from "../httpControllers/vetHttpController";
import { authenticate, vetOnly } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/fileHandler";

const router = Router();

// Clinic management routes
router.post(
  "/clinics",
  authenticate,
  vetOnly,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "coverPicture", maxCount: 1 },
    { name: "clinicImages", maxCount: 5 },
  ]),
  handleCreateClinic
);

// Get all clinics for the authenticated vet
router.get("/clinics", authenticate, vetOnly, handleGetVetClinics);

// Get specific clinic by ID
router.get("/clinics/:id", authenticate, vetOnly, handleGetClinicById);

// Update clinic details
router.put(
  "/clinics/:id",
  authenticate,
  vetOnly,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "coverPicture", maxCount: 1 },
    { name: "clinicImages", maxCount: 5 },
  ]),
  handleUpdateClinic
);

// Update clinic status (active/inactive)
router.patch(
  "/clinics/:id/status",
  authenticate,
  vetOnly,
  handleUpdateClinicStatus
);

// Delete clinic
router.delete("/clinics/:id", authenticate, vetOnly, handleDeleteClinic);

export default router;
