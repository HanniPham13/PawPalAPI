import { Router } from "express";
import { handleAdminLogin, handleGetPendingVerifications, handleApproveVerification, handleRejectVerification, handleCreateAdmin } from "../httpControllers/adminHttpController";
import { authenticate, adminOnly } from "../middlewares/authMiddleware";

const router = Router();

// Admin authentication routes
router.post('/login', handleAdminLogin);
router.post('/create', handleCreateAdmin);

// Admin verification routes
router.get('/verifications', authenticate, adminOnly, handleGetPendingVerifications);
router.put('/verifications/:verificationId/approve', authenticate, adminOnly, handleApproveVerification);
router.put('/verifications/:verificationId/reject', authenticate, adminOnly, handleRejectVerification);

export default router;

