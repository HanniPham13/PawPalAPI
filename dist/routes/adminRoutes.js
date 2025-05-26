"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminHttpController_1 = require("../httpControllers/adminHttpController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Admin authentication routes
router.post('/login', adminHttpController_1.handleAdminLogin);
router.post('/create', adminHttpController_1.handleCreateAdmin);
// Admin verification routes
router.get('/verifications', authMiddleware_1.authenticate, authMiddleware_1.adminOnly, adminHttpController_1.handleGetPendingVerifications);
router.put('/verifications/:verificationId/approve', authMiddleware_1.authenticate, authMiddleware_1.adminOnly, adminHttpController_1.handleApproveVerification);
router.put('/verifications/:verificationId/reject', authMiddleware_1.authenticate, authMiddleware_1.adminOnly, adminHttpController_1.handleRejectVerification);
// Admin user management routes
router.post('/register-vet', authMiddleware_1.authenticate, authMiddleware_1.adminOnly, adminHttpController_1.handleRegisterVet);
// Admin vet document management routes
router.get('/vet-documents', authMiddleware_1.authenticate, authMiddleware_1.adminOnly, adminHttpController_1.handleGetPendingVetDocuments);
router.put('/vet-documents/:documentId/approve', authMiddleware_1.authenticate, authMiddleware_1.adminOnly, adminHttpController_1.handleApproveVetDocument);
router.put('/vet-documents/:documentId/reject', authMiddleware_1.authenticate, authMiddleware_1.adminOnly, adminHttpController_1.handleRejectVetDocument);
// Admin pet medical record verification routes
router.get('/medical-records', authMiddleware_1.authenticate, authMiddleware_1.adminOnly, adminHttpController_1.handleGetPendingMedicalRecords);
router.put('/medical-records/:recordId/approve', authMiddleware_1.authenticate, authMiddleware_1.adminOnly, adminHttpController_1.handleApproveMedicalRecord);
router.put('/medical-records/:recordId/reject', authMiddleware_1.authenticate, authMiddleware_1.adminOnly, adminHttpController_1.handleRejectMedicalRecord);
exports.default = router;
