"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vetHttpController_1 = require("../httpControllers/vetHttpController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const fileHandler_1 = require("../middlewares/fileHandler");
const router = (0, express_1.Router)();
// Clinic management routes
router.post('/clinics', authMiddleware_1.authenticate, authMiddleware_1.vetOnly, fileHandler_1.upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverPicture', maxCount: 1 },
    { name: 'clinicImages', maxCount: 5 }
]), vetHttpController_1.handleCreateClinic);
router.get('/clinics', authMiddleware_1.authenticate, authMiddleware_1.vetOnly, vetHttpController_1.handleGetVetClinics);
exports.default = router;
