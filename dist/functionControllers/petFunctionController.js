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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMedicalRecord = exports.getMedicalRecords = exports.deleteMedicalRecord = exports.updateMedicalRecord = exports.addMedicalRecord = exports.toggleAdoptableStatus = exports.getUserPets = exports.getPetProfile = exports.deletePetProfile = exports.updatePetProfile = exports.createPetProfile = void 0;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const createPetProfile = (ownerId, petData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate owner exists
        const owner = yield prisma.user.findUnique({
            where: { id: ownerId }
        });
        if (!owner) {
            return {
                success: false,
                message: 'User not found'
            };
        }
        // Create pet profile
        const newPet = yield prisma.petProfile.create({
            data: {
                name: petData.name,
                species: petData.species,
                breed: petData.breed,
                age: petData.age,
                gender: petData.gender,
                size: petData.size,
                color: petData.color,
                description: petData.description,
                isAdoptable: petData.isAdoptable || false,
                profilePicture: petData.profilePicture,
                owner: {
                    connect: { id: ownerId }
                }
            }
        });
        return {
            success: true,
            message: 'Pet profile created successfully',
            data: newPet
        };
    }
    catch (error) {
        console.error('Error creating pet profile:', error);
        return {
            success: false,
            message: 'Failed to create pet profile'
        };
    }
});
exports.createPetProfile = createPetProfile;
const updatePetProfile = (petId, ownerId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if pet exists and belongs to this owner
        const existingPet = yield prisma.petProfile.findFirst({
            where: {
                id: petId,
                ownerId: ownerId
            }
        });
        if (!existingPet) {
            return {
                success: false,
                message: 'Pet profile not found or you do not have permission to edit it'
            };
        }
        // Store old profile picture path to delete if needed
        const oldProfilePicture = existingPet.profilePicture;
        // Update pet profile
        const updatedPet = yield prisma.petProfile.update({
            where: { id: petId },
            data: updateData
        });
        // Delete old profile picture if it was replaced
        if (oldProfilePicture && updateData.profilePicture && oldProfilePicture !== updateData.profilePicture) {
            try {
                fs_1.default.unlinkSync(path_1.default.join(process.cwd(), oldProfilePicture));
            }
            catch (err) {
                console.error('Error deleting old profile picture:', err);
                // Proceed anyway as this is not critical
            }
        }
        return {
            success: true,
            message: 'Pet profile updated successfully',
            data: updatedPet
        };
    }
    catch (error) {
        console.error('Error updating pet profile:', error);
        return {
            success: false,
            message: 'Failed to update pet profile'
        };
    }
});
exports.updatePetProfile = updatePetProfile;
const deletePetProfile = (petId, ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if pet exists and belongs to this owner
        const pet = yield prisma.petProfile.findFirst({
            where: {
                id: petId,
                ownerId: ownerId
            }
        });
        if (!pet) {
            return {
                success: false,
                message: 'Pet profile not found or you do not have permission to delete it'
            };
        }
        // Delete the pet profile
        yield prisma.petProfile.delete({
            where: { id: petId }
        });
        // Clean up profile picture if it exists
        if (pet.profilePicture) {
            try {
                fs_1.default.unlinkSync(path_1.default.join(process.cwd(), pet.profilePicture));
            }
            catch (err) {
                console.error('Error deleting profile picture:', err);
                // Proceed anyway as the pet was already deleted from the database
            }
        }
        return {
            success: true,
            message: 'Pet profile deleted successfully'
        };
    }
    catch (error) {
        console.error('Error deleting pet profile:', error);
        return {
            success: false,
            message: 'Failed to delete pet profile'
        };
    }
});
exports.deletePetProfile = deletePetProfile;
const getPetProfile = (petId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pet = yield prisma.petProfile.findUnique({
            where: { id: petId },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        if (!pet) {
            return {
                success: false,
                message: 'Pet profile not found'
            };
        }
        return {
            success: true,
            message: 'Pet profile retrieved successfully',
            data: pet
        };
    }
    catch (error) {
        console.error('Error retrieving pet profile:', error);
        return {
            success: false,
            message: 'Failed to retrieve pet profile'
        };
    }
});
exports.getPetProfile = getPetProfile;
const getUserPets = (ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pets = yield prisma.petProfile.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' }
        });
        return {
            success: true,
            message: 'Pet profiles retrieved successfully',
            data: pets
        };
    }
    catch (error) {
        console.error('Error retrieving user pets:', error);
        return {
            success: false,
            message: 'Failed to retrieve pet profiles'
        };
    }
});
exports.getUserPets = getUserPets;
const toggleAdoptableStatus = (petId, ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if pet exists and belongs to this owner
        const pet = yield prisma.petProfile.findFirst({
            where: {
                id: petId,
                ownerId: ownerId
            }
        });
        if (!pet) {
            return {
                success: false,
                message: 'Pet profile not found or you do not have permission to modify it'
            };
        }
        // Toggle isAdoptable status
        const updatedPet = yield prisma.petProfile.update({
            where: { id: petId },
            data: { isAdoptable: !pet.isAdoptable }
        });
        return {
            success: true,
            message: `Pet is now ${updatedPet.isAdoptable ? 'available' : 'not available'} for adoption`,
            data: updatedPet
        };
    }
    catch (error) {
        console.error('Error toggling adoptable status:', error);
        return {
            success: false,
            message: 'Failed to update pet adoption status'
        };
    }
});
exports.toggleAdoptableStatus = toggleAdoptableStatus;
// Medical record functions
const addMedicalRecord = (petId, ownerId, medicalData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if pet exists and belongs to this owner
        const pet = yield prisma.petProfile.findFirst({
            where: {
                id: petId,
                ownerId: ownerId
            }
        });
        if (!pet) {
            return {
                success: false,
                message: 'Pet profile not found or you do not have permission to add medical records'
            };
        }
        // Create medical record
        const medicalRecord = yield prisma.medicalRecord.create({
            data: {
                title: medicalData.title,
                description: medicalData.description,
                date: medicalData.date,
                documentUrl: medicalData.documentUrl,
                petProfile: {
                    connect: { id: petId }
                }
            }
        });
        return {
            success: true,
            message: 'Medical record added successfully',
            data: medicalRecord
        };
    }
    catch (error) {
        console.error('Error adding medical record:', error);
        return {
            success: false,
            message: 'Failed to add medical record'
        };
    }
});
exports.addMedicalRecord = addMedicalRecord;
const updateMedicalRecord = (recordId, petId, ownerId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if pet exists and belongs to this owner
        const pet = yield prisma.petProfile.findFirst({
            where: {
                id: petId,
                ownerId: ownerId
            }
        });
        if (!pet) {
            return {
                success: false,
                message: 'Pet profile not found or you do not have permission to update medical records'
            };
        }
        // Check if medical record exists and belongs to this pet
        const existingRecord = yield prisma.medicalRecord.findFirst({
            where: {
                id: recordId,
                petProfileId: petId
            }
        });
        if (!existingRecord) {
            return {
                success: false,
                message: 'Medical record not found'
            };
        }
        // Store old document URL to delete if needed
        const oldDocumentUrl = existingRecord.documentUrl;
        // Update medical record
        const updatedRecord = yield prisma.medicalRecord.update({
            where: { id: recordId },
            data: updateData
        });
        // Delete old document if it was replaced
        if (oldDocumentUrl && updateData.documentUrl && oldDocumentUrl !== updateData.documentUrl) {
            try {
                fs_1.default.unlinkSync(path_1.default.join(process.cwd(), oldDocumentUrl));
            }
            catch (err) {
                console.error('Error deleting old medical document:', err);
                // Proceed anyway as this is not critical
            }
        }
        return {
            success: true,
            message: 'Medical record updated successfully',
            data: updatedRecord
        };
    }
    catch (error) {
        console.error('Error updating medical record:', error);
        return {
            success: false,
            message: 'Failed to update medical record'
        };
    }
});
exports.updateMedicalRecord = updateMedicalRecord;
const deleteMedicalRecord = (recordId, petId, ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if pet exists and belongs to this owner
        const pet = yield prisma.petProfile.findFirst({
            where: {
                id: petId,
                ownerId: ownerId
            }
        });
        if (!pet) {
            return {
                success: false,
                message: 'Pet profile not found or you do not have permission to delete medical records'
            };
        }
        // Check if medical record exists and belongs to this pet
        const record = yield prisma.medicalRecord.findFirst({
            where: {
                id: recordId,
                petProfileId: petId
            }
        });
        if (!record) {
            return {
                success: false,
                message: 'Medical record not found'
            };
        }
        // Delete the medical record
        yield prisma.medicalRecord.delete({
            where: { id: recordId }
        });
        // Clean up document file if it exists
        if (record.documentUrl) {
            try {
                fs_1.default.unlinkSync(path_1.default.join(process.cwd(), record.documentUrl));
            }
            catch (err) {
                console.error('Error deleting medical document:', err);
                // Proceed anyway as the record was already deleted from the database
            }
        }
        return {
            success: true,
            message: 'Medical record deleted successfully'
        };
    }
    catch (error) {
        console.error('Error deleting medical record:', error);
        return {
            success: false,
            message: 'Failed to delete medical record'
        };
    }
});
exports.deleteMedicalRecord = deleteMedicalRecord;
const getMedicalRecords = (petId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const records = yield prisma.medicalRecord.findMany({
            where: { petProfileId: petId },
            orderBy: { date: 'desc' }
        });
        return {
            success: true,
            message: 'Medical records retrieved successfully',
            data: records
        };
    }
    catch (error) {
        console.error('Error retrieving medical records:', error);
        return {
            success: false,
            message: 'Failed to retrieve medical records'
        };
    }
});
exports.getMedicalRecords = getMedicalRecords;
const getMedicalRecord = (recordId, petId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const record = yield prisma.medicalRecord.findFirst({
            where: {
                id: recordId,
                petProfileId: petId
            }
        });
        if (!record) {
            return {
                success: false,
                message: 'Medical record not found'
            };
        }
        return {
            success: true,
            message: 'Medical record retrieved successfully',
            data: record
        };
    }
    catch (error) {
        console.error('Error retrieving medical record:', error);
        return {
            success: false,
            message: 'Failed to retrieve medical record'
        };
    }
});
exports.getMedicalRecord = getMedicalRecord;
