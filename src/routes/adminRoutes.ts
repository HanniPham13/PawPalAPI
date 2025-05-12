import { Router } from "express";
import { 
  handleAdminLogin, 
  handleGetPendingVerifications, 
  handleApproveVerification, 
  handleRejectVerification, 
  handleCreateAdmin, 
  handleRegisterVet, 
  handleGetPendingVetDocuments,
  handleApproveVetDocument,
  handleRejectVetDocument,
  handleGetPendingMedicalRecords,
  handleApproveMedicalRecord,
  handleRejectMedicalRecord
} from "../httpControllers/adminHttpController";
import { authenticate, adminOnly } from "../middlewares/authMiddleware";

const router = Router();

// Admin authentication routes
router.post('/login', handleAdminLogin);
router.post('/create', handleCreateAdmin);

// Admin verification routes
router.get('/verifications', authenticate, adminOnly, handleGetPendingVerifications);
router.put('/verifications/:verificationId/approve', authenticate, adminOnly, handleApproveVerification);
router.put('/verifications/:verificationId/reject', authenticate, adminOnly, handleRejectVerification);

// Admin user management routes
router.post('/register-vet', authenticate, adminOnly, handleRegisterVet);

// Admin vet document management routes
router.get('/vet-documents', authenticate, adminOnly, handleGetPendingVetDocuments);
router.put('/vet-documents/:documentId/approve', authenticate, adminOnly, handleApproveVetDocument);
router.put('/vet-documents/:documentId/reject', authenticate, adminOnly, handleRejectVetDocument);

// Admin pet medical record verification routes
router.get('/medical-records', authenticate, adminOnly, handleGetPendingMedicalRecords);
router.put('/medical-records/:recordId/approve', authenticate, adminOnly, handleApproveMedicalRecord);
router.put('/medical-records/:recordId/reject', authenticate, adminOnly, handleRejectMedicalRecord);

export default router;

