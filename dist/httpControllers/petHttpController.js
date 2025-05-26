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
exports.handleGetMedicalRecord = exports.handleGetMedicalRecords = exports.handleDeleteMedicalRecord = exports.handleUpdateMedicalRecord = exports.handleAddMedicalRecord = exports.handleToggleAdoptableStatus = exports.handleGetUserPets = exports.handleGetPetProfile = exports.handleDeletePetProfile = exports.handleUpdatePetProfile = exports.handleCreatePetProfile = void 0;
const client_1 = require("@prisma/client");
const petFunctionController_1 = require("../functionControllers/petFunctionController");
// Helper to validate enum values
const isValidEnum = (value, enumObj) => {
    return Object.values(enumObj).includes(value);
};
const handleCreatePetProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { name, species, breed, age, gender, size, color, description, isAdoptable } = req.body;
        const profilePicture = req.file ? req.file.path : undefined;
        // Validate required fields
        if (!name || !species) {
            res.status(400).json({ success: false, message: 'Pet name and species are required' });
            return;
        }
        // Validate species enum
        if (!isValidEnum(species, client_1.PetSpecies)) {
            res.status(400).json({
                success: false,
                message: `Invalid species. Must be one of: ${Object.values(client_1.PetSpecies).join(', ')}`
            });
            return;
        }
        // Validate gender enum if provided
        if (gender && !isValidEnum(gender, client_1.PetGender)) {
            res.status(400).json({
                success: false,
                message: `Invalid gender. Must be one of: ${Object.values(client_1.PetGender).join(', ')}`
            });
            return;
        }
        // Validate size enum if provided
        if (size && !isValidEnum(size, client_1.PetSize)) {
            res.status(400).json({
                success: false,
                message: `Invalid size. Must be one of: ${Object.values(client_1.PetSize).join(', ')}`
            });
            return;
        }
        // Validate age if provided
        if (age !== undefined && (isNaN(Number(age)) || Number(age) < 0)) {
            res.status(400).json({ success: false, message: 'Age must be a positive number' });
            return;
        }
        // Create pet profile
        const result = yield (0, petFunctionController_1.createPetProfile)(userId, {
            name,
            species,
            breed,
            age: age !== undefined ? Number(age) : undefined,
            gender,
            size,
            color,
            description,
            isAdoptable: isAdoptable === true || isAdoptable === 'true',
            profilePicture
        });
        if (result.success) {
            res.status(201).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Error in handleCreatePetProfile:', error);
        res.status(500).json({ success: false, message: 'Server error while creating pet profile' });
    }
});
exports.handleCreatePetProfile = handleCreatePetProfile;
const handleUpdatePetProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { petId } = req.params;
        if (!petId) {
            res.status(400).json({ success: false, message: 'Pet ID is required' });
            return;
        }
        const { name, species, breed, age, gender, size, color, description, isAdoptable } = req.body;
        const profilePicture = req.file ? req.file.path : undefined;
        // Validate input fields if provided
        if (species && !isValidEnum(species, client_1.PetSpecies)) {
            res.status(400).json({
                success: false,
                message: `Invalid species. Must be one of: ${Object.values(client_1.PetSpecies).join(', ')}`
            });
            return;
        }
        if (gender && !isValidEnum(gender, client_1.PetGender)) {
            res.status(400).json({
                success: false,
                message: `Invalid gender. Must be one of: ${Object.values(client_1.PetGender).join(', ')}`
            });
            return;
        }
        if (size && !isValidEnum(size, client_1.PetSize)) {
            res.status(400).json({
                success: false,
                message: `Invalid size. Must be one of: ${Object.values(client_1.PetSize).join(', ')}`
            });
            return;
        }
        if (age !== undefined && (isNaN(Number(age)) || Number(age) < 0)) {
            res.status(400).json({ success: false, message: 'Age must be a positive number' });
            return;
        }
        const updateData = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (species && { species })), (breed !== undefined && { breed })), (age !== undefined && { age: Number(age) })), (gender && { gender })), (size && { size })), (color !== undefined && { color })), (description !== undefined && { description })), (isAdoptable !== undefined && { isAdoptable: isAdoptable === true || isAdoptable === 'true' })), (profilePicture && { profilePicture }));
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ success: false, message: 'No update data provided' });
            return;
        }
        const result = yield (0, petFunctionController_1.updatePetProfile)(petId, userId, updateData);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Error in handleUpdatePetProfile:', error);
        res.status(500).json({ success: false, message: 'Server error while updating pet profile' });
    }
});
exports.handleUpdatePetProfile = handleUpdatePetProfile;
const handleDeletePetProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { petId } = req.params;
        if (!petId) {
            res.status(400).json({ success: false, message: 'Pet ID is required' });
            return;
        }
        const result = yield (0, petFunctionController_1.deletePetProfile)(petId, userId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(404).json(result);
        }
    }
    catch (error) {
        console.error('Error in handleDeletePetProfile:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting pet profile' });
    }
});
exports.handleDeletePetProfile = handleDeletePetProfile;
const handleGetPetProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { petId } = req.params;
        if (!petId) {
            res.status(400).json({ success: false, message: 'Pet ID is required' });
            return;
        }
        const result = yield (0, petFunctionController_1.getPetProfile)(petId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(404).json(result);
        }
    }
    catch (error) {
        console.error('Error in handleGetPetProfile:', error);
        res.status(500).json({ success: false, message: 'Server error while retrieving pet profile' });
    }
});
exports.handleGetPetProfile = handleGetPetProfile;
const handleGetUserPets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = req.params.userId || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!userId) {
            res.status(401).json({ success: false, message: 'User ID is required' });
            return;
        }
        const result = yield (0, petFunctionController_1.getUserPets)(userId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Error in handleGetUserPets:', error);
        res.status(500).json({ success: false, message: 'Server error while retrieving user pets' });
    }
});
exports.handleGetUserPets = handleGetUserPets;
const handleToggleAdoptableStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { petId } = req.params;
        if (!petId) {
            res.status(400).json({ success: false, message: 'Pet ID is required' });
            return;
        }
        const result = yield (0, petFunctionController_1.toggleAdoptableStatus)(petId, userId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(404).json(result);
        }
    }
    catch (error) {
        console.error('Error in handleToggleAdoptableStatus:', error);
        res.status(500).json({ success: false, message: 'Server error while updating pet adoption status' });
    }
});
exports.handleToggleAdoptableStatus = handleToggleAdoptableStatus;
// Medical Record Handler Functions
const handleAddMedicalRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { petId } = req.params;
        if (!petId) {
            res.status(400).json({ success: false, message: 'Pet ID is required' });
            return;
        }
        const { title, description, date } = req.body;
        const documentUrl = req.file ? req.file.path : undefined;
        // Validate required fields
        if (!title || !description || !date) {
            res.status(400).json({ success: false, message: 'Title, description and date are required' });
            return;
        }
        // Validate date format
        const recordDate = new Date(date);
        if (isNaN(recordDate.getTime())) {
            res.status(400).json({ success: false, message: 'Invalid date format' });
            return;
        }
        const result = yield (0, petFunctionController_1.addMedicalRecord)(petId, userId, {
            title,
            description,
            date: recordDate,
            documentUrl
        });
        if (result.success) {
            res.status(201).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Error in handleAddMedicalRecord:', error);
        res.status(500).json({ success: false, message: 'Server error while adding medical record' });
    }
});
exports.handleAddMedicalRecord = handleAddMedicalRecord;
const handleUpdateMedicalRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { petId, recordId } = req.params;
        if (!petId || !recordId) {
            res.status(400).json({ success: false, message: 'Pet ID and record ID are required' });
            return;
        }
        const { title, description, date } = req.body;
        const documentUrl = req.file ? req.file.path : undefined;
        // Prepare update data with only provided fields
        const updateData = {};
        if (title !== undefined) {
            updateData.title = title;
        }
        if (description !== undefined) {
            updateData.description = description;
        }
        if (date) {
            const recordDate = new Date(date);
            if (isNaN(recordDate.getTime())) {
                res.status(400).json({ success: false, message: 'Invalid date format' });
                return;
            }
            updateData.date = recordDate;
        }
        if (documentUrl) {
            updateData.documentUrl = documentUrl;
        }
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ success: false, message: 'No update data provided' });
            return;
        }
        const result = yield (0, petFunctionController_1.updateMedicalRecord)(recordId, petId, userId, updateData);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(404).json(result);
        }
    }
    catch (error) {
        console.error('Error in handleUpdateMedicalRecord:', error);
        res.status(500).json({ success: false, message: 'Server error while updating medical record' });
    }
});
exports.handleUpdateMedicalRecord = handleUpdateMedicalRecord;
const handleDeleteMedicalRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { petId, recordId } = req.params;
        if (!petId || !recordId) {
            res.status(400).json({ success: false, message: 'Pet ID and record ID are required' });
            return;
        }
        const result = yield (0, petFunctionController_1.deleteMedicalRecord)(recordId, petId, userId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(404).json(result);
        }
    }
    catch (error) {
        console.error('Error in handleDeleteMedicalRecord:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting medical record' });
    }
});
exports.handleDeleteMedicalRecord = handleDeleteMedicalRecord;
const handleGetMedicalRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { petId } = req.params;
        if (!petId) {
            res.status(400).json({ success: false, message: 'Pet ID is required' });
            return;
        }
        const result = yield (0, petFunctionController_1.getMedicalRecords)(petId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(404).json(result);
        }
    }
    catch (error) {
        console.error('Error in handleGetMedicalRecords:', error);
        res.status(500).json({ success: false, message: 'Server error while retrieving medical records' });
    }
});
exports.handleGetMedicalRecords = handleGetMedicalRecords;
const handleGetMedicalRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { petId, recordId } = req.params;
        if (!petId || !recordId) {
            res.status(400).json({ success: false, message: 'Pet ID and record ID are required' });
            return;
        }
        const result = yield (0, petFunctionController_1.getMedicalRecord)(recordId, petId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(404).json(result);
        }
    }
    catch (error) {
        console.error('Error in handleGetMedicalRecord:', error);
        res.status(500).json({ success: false, message: 'Server error while retrieving medical record' });
    }
});
exports.handleGetMedicalRecord = handleGetMedicalRecord;
