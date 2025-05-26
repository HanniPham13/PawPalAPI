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
exports.getVetClinics = exports.createClinic = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Function to create a new clinic
const createClinic = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user exists and is a VET
        const user = yield prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }
        if (user.role !== 'VET') {
            return {
                success: false,
                message: 'Only veterinarians can create clinics'
            };
        }
        // Create the clinic
        const clinic = yield prisma.clinic.create({
            data: Object.assign({ name: data.name, description: data.description, phone: data.phone, email: data.email, website: data.website, operatingHours: data.operatingHours, profilePictureUrl: data.profilePictureUrl, coverPictureUrl: data.coverPictureUrl, verificationStatus: 'PENDING', ownerId: userId, 
                // Create address
                address: {
                    create: {
                        address: data.address.address,
                        city: data.address.city,
                        state: data.address.state,
                        zipCode: data.address.zipCode
                    }
                } }, (data.images && data.images.length > 0
                ? {
                    ClinicImage: {
                        createMany: {
                            data: data.images.map(imageUrl => ({
                                imageUrl
                            }))
                        }
                    }
                }
                : {})),
            include: {
                address: true,
                ClinicImage: true
            }
        });
        return {
            success: true,
            message: 'Clinic created successfully',
            data: clinic
        };
    }
    catch (error) {
        console.error('Create clinic error:', error);
        return {
            success: false,
            message: 'Failed to create clinic'
        };
    }
});
exports.createClinic = createClinic;
// Function to get clinics owned by a vet
const getVetClinics = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clinics = yield prisma.clinic.findMany({
            where: {
                ownerId: userId
            },
            include: {
                address: true,
                ClinicImage: true
            }
        });
        return {
            success: true,
            message: 'Clinics retrieved successfully',
            data: clinics
        };
    }
    catch (error) {
        console.error('Get vet clinics error:', error);
        return {
            success: false,
            message: 'Failed to retrieve clinics'
        };
    }
});
exports.getVetClinics = getVetClinics;
