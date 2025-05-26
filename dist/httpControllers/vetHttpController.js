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
exports.handleGetVetClinics = exports.handleCreateClinic = void 0;
const vetFunctionController_1 = require("../functionControllers/vetFunctionController");
// Handler to create a new clinic
const handleCreateClinic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if user is a vet
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'VET') {
            res.status(403).json({ success: false, message: 'Unauthorized. Vet access only.' });
            return;
        }
        const { name, description, phone, email, website, operatingHours, address } = req.body;
        // Validate required fields
        if (!name) {
            res.status(400).json({ success: false, message: 'Clinic name is required' });
            return;
        }
        if (!address || !address.address || !address.city || !address.state || !address.zipCode) {
            res.status(400).json({ success: false, message: 'Complete address is required' });
            return;
        }
        // Get profile and cover picture URLs if uploaded
        let profilePictureUrl;
        let coverPictureUrl;
        if (req.files) {
            // Handle both array of files and single files (multer types)
            const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
            filesArray.forEach((file) => {
                // Convert local path to URL path
                const imagePath = file.path.replace(/\\/g, '/');
                if (file.fieldname === 'profilePicture') {
                    profilePictureUrl = imagePath;
                }
                else if (file.fieldname === 'coverPicture') {
                    coverPictureUrl = imagePath;
                }
                else if (file.fieldname === 'clinicImages') {
                    // For other clinic images
                    if (!req.body.images) {
                        req.body.images = [];
                    }
                    req.body.images.push(imagePath);
                }
            });
        }
        // Get additional clinic images if any
        const images = req.body.images || [];
        const result = yield (0, vetFunctionController_1.createClinic)(req.user.id, {
            name,
            description,
            phone,
            email,
            website,
            operatingHours,
            profilePictureUrl,
            coverPictureUrl,
            address,
            images
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
        res.status(500).json({ success: false, message: 'Failed to create clinic' });
    }
});
exports.handleCreateClinic = handleCreateClinic;
// Handler to get vet's clinics
const handleGetVetClinics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if user is a vet
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'VET') {
            res.status(403).json({ success: false, message: 'Unauthorized. Vet access only.' });
            return;
        }
        const result = yield (0, vetFunctionController_1.getVetClinics)(req.user.id);
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
        res.status(500).json({ success: false, message: 'Failed to retrieve clinics' });
    }
});
exports.handleGetVetClinics = handleGetVetClinics;
