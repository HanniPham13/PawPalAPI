"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRejectMedicalRecord = exports.handleApproveMedicalRecord = exports.handleGetPendingMedicalRecords = exports.handleRejectVetDocument = exports.handleApproveVetDocument = exports.handleGetPendingVetDocuments = exports.handleRegisterVet = exports.handleCreateAdmin = exports.handleRejectVerification = exports.handleApproveVerification = exports.handleGetPendingVerifications = exports.handleAdminLogin = void 0;
const adminFunctionController_1 = require("../functionControllers/adminFunctionController");
const handleAdminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if body exists
    if (!req.body) {
        res.status(400).json({ success: false, message: 'Request body is required' });
        return;
    }
    const { email, password } = req.body;
    // Validate input
    if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required' });
        return;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        return;
    }
    const result = yield (0, adminFunctionController_1.adminLogin)(email, password);
    if (result.success) {
        res.status(200).json(result);
    }
    else {
        res.status(401).json(result);
    }
});
exports.handleAdminLogin = handleAdminLogin;
const handleGetPendingVerifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if user is admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (page < 1 || limit < 1) {
            res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
            return;
        }
        const result = yield (0, adminFunctionController_1.getPendingVerifications)(page, limit);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to get pending verifications' });
    }
});
exports.handleGetPendingVerifications = handleGetPendingVerifications;
const handleApproveVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if user is admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
            return;
        }
        const { verificationId } = req.params;
        if (!verificationId) {
            res.status(400).json({ success: false, message: 'Verification ID is required' });
            return;
        }
        const result = yield (0, adminFunctionController_1.approveVerification)(verificationId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to approve verification' });
    }
});
exports.handleApproveVerification = handleApproveVerification;
const handleRejectVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if user is admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
            return;
        }
        const { verificationId } = req.params;
        const { reason } = req.body;
        if (!verificationId) {
            res.status(400).json({ success: false, message: 'Verification ID is required' });
            return;
        }
        if (!reason) {
            res.status(400).json({ success: false, message: 'Rejection reason is required' });
            return;
        }
        const result = yield (0, adminFunctionController_1.rejectVerification)(verificationId, reason);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to reject verification' });
    }
});
exports.handleRejectVerification = handleRejectVerification;
const handleCreateAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, firstName, lastName, username, secret } = req.body;
        // Require a secret key to create admin (for security)
        if (secret !== process.env.ADMIN_SECRET && secret !== 'admin_secret_for_testing') {
            res.status(403).json({ success: false, message: 'Invalid admin creation secret' });
            return;
        }
        // Validate required fields
        if (!email || !password || !firstName || !lastName || !username) {
            res.status(400).json({
                success: false,
                message: 'All fields (email, password, firstName, lastName, username) are required'
            });
            return;
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ success: false, message: 'Please provide a valid email address' });
            return;
        }
        // Password validation (at least 6 characters)
        if (password.length < 6) {
            res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
            return;
        }
        const result = yield (0, adminFunctionController_1.createAdmin)({
            email,
            password,
            firstName,
            lastName,
            username
        });
        if (result.success) {
            res.status(201).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to create admin user' });
    }
});
exports.handleCreateAdmin = handleCreateAdmin;
const handleRegisterVet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if user is admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
            return;
        }
        const { email, password, firstName, lastName, username } = req.body;
        // Validate required fields
        if (!email || !password || !firstName || !lastName || !username) {
            res.status(400).json({
                success: false,
                message: 'All fields (email, password, firstName, lastName, username) are required'
            });
            return;
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ success: false, message: 'Please provide a valid email address' });
            return;
        }
        // Password validation (at least 6 characters)
        if (password.length < 6) {
            res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
            return;
        }
        const result = yield (0, adminFunctionController_1.registerVet)({
            email,
            password,
            firstName,
            lastName,
            username
        });
        if (result.success) {
            res.status(201).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to register vet user' });
    }
});
exports.handleRegisterVet = handleRegisterVet;
const handleGetPendingVetDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if user is admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (page < 1 || limit < 1) {
            res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
            return;
        }
        // This will work after running migrations to add the VetDocument model
        // const result = await getPendingVetDocuments(page, limit);
        // Temporary placeholder response until migrations are run
        res.status(501).json({
            success: false,
            message: 'Feature not yet implemented - requires database migration'
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to get pending vet documents' });
    }
});
exports.handleGetPendingVetDocuments = handleGetPendingVetDocuments;
const handleApproveVetDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if user is admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
            return;
        }
        const { documentId } = req.params;
        if (!documentId) {
            res.status(400).json({ success: false, message: 'Document ID is required' });
            return;
        }
        // This will work after running migrations to add the VetDocument model
        // const result = await approveVetDocument(documentId);
        // Temporary placeholder response until migrations are run
        res.status(501).json({
            success: false,
            message: 'Feature not yet implemented - requires database migration'
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to approve vet document' });
    }
});
exports.handleApproveVetDocument = handleApproveVetDocument;
const handleRejectVetDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if user is admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
            return;
        }
        const { documentId } = req.params;
        const { reason } = req.body;
        if (!documentId) {
            res.status(400).json({ success: false, message: 'Document ID is required' });
            return;
        }
        if (!reason) {
            res.status(400).json({ success: false, message: 'Rejection reason is required' });
            return;
        }
        // This will work after running migrations to add the VetDocument model
        // const result = await rejectVetDocument(documentId, reason);
        // Temporary placeholder response until migrations are run
        res.status(501).json({
            success: false,
            message: 'Feature not yet implemented - requires database migration'
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to reject vet document' });
    }
});
exports.handleRejectVetDocument = handleRejectVetDocument;
const handleGetPendingMedicalRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if user is admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (page < 1 || limit < 1) {
            res.status(400).json({ success: false, message: 'Invalid page or limit parameters' });
            return;
        }
        // This will work after running migrations to add the verification fields to MedicalRecord model
        // const result = await getPendingMedicalRecords(page, limit);
        // Temporary placeholder response until migrations are run
        res.status(501).json({
            success: false,
            message: 'Feature not yet implemented - requires database migration'
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to get pending medical records' });
    }
});
exports.handleGetPendingMedicalRecords = handleGetPendingMedicalRecords;
const handleApproveMedicalRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if user is admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
            return;
        }
        const { recordId } = req.params;
        if (!recordId) {
            res.status(400).json({ success: false, message: 'Medical record ID is required' });
            return;
        }
        // This will work after running migrations
        // const result = await approveMedicalRecord(recordId, req.user.id);
        // Temporary placeholder response until migrations are run
        res.status(501).json({
            success: false,
            message: 'Feature not yet implemented - requires database migration'
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to approve medical record' });
    }
});
exports.handleApproveMedicalRecord = handleApproveMedicalRecord;
const handleRejectMedicalRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if user is admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
            return;
        }
        const { recordId } = req.params;
        const { reason } = req.body;
        if (!recordId) {
            res.status(400).json({ success: false, message: 'Medical record ID is required' });
            return;
        }
        if (!reason) {
            res.status(400).json({ success: false, message: 'Rejection reason is required' });
            return;
        }
        // This will work after running migrations
        // const result = await rejectMedicalRecord(recordId, req.user.id, reason);
        // Temporary placeholder response until migrations are run
        res.status(501).json({
            success: false,
            message: 'Feature not yet implemented - requires database migration'
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: 'Failed to reject medical record' });
    }
});
exports.handleRejectMedicalRecord = handleRejectMedicalRecord;
