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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectMedicalRecord = exports.approveMedicalRecord = exports.getPendingMedicalRecords = exports.rejectVetDocument = exports.approveVetDocument = exports.getPendingVetDocuments = exports.registerVet = exports.createAdmin = exports.rejectVerification = exports.approveVerification = exports.getPendingVerifications = exports.adminLogin = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailService_1 = require("../services/emailService");
const prisma = new client_1.PrismaClient();
const adminLogin = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the user by email
        const user = yield prisma.user.findUnique({
            where: { email }
        });
        // Check if user exists
        if (!user) {
            return {
                success: false,
                message: 'Invalid credentials'
            };
        }
        // Check if user email is verified
        if (!user.isEmailVerified) {
            return {
                success: false,
                message: 'Please verify your email before logging in'
            };
        }
        // Check if user is an admin
        if (user.role !== 'ADMIN') {
            return {
                success: false,
                message: 'Unauthorized. Admin access only.'
            };
        }
        // Check if password is correct
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return {
                success: false,
                message: 'Invalid credentials'
            };
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
        // Return user data without password
        const { password: _, verificationCode: __ } = user, userWithoutSensitiveInfo = __rest(user, ["password", "verificationCode"]);
        return {
            success: true,
            message: 'Admin login successful',
            token,
            user: userWithoutSensitiveInfo
        };
    }
    catch (error) {
        console.error('Admin login error:', error);
        return {
            success: false,
            message: 'An error occurred during login'
        };
    }
});
exports.adminLogin = adminLogin;
const getPendingVerifications = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const verifications = yield prisma.verificationDocument.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profile: {
                            select: {
                                profilePictureUrl: true
                            }
                        }
                    }
                },
                VerificationDocumentFile: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit + 1
        });
        const hasMore = verifications.length > limit;
        const verificationsToReturn = hasMore ? verifications.slice(0, limit) : verifications;
        return {
            success: true,
            message: 'Pending verifications retrieved successfully',
            data: verificationsToReturn,
            hasMore
        };
    }
    catch (error) {
        console.error('Get pending verifications error:', error);
        return {
            success: false,
            message: 'Failed to retrieve pending verifications',
            hasMore: false
        };
    }
});
exports.getPendingVerifications = getPendingVerifications;
const approveVerification = (verificationId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the verification document
        const verification = yield prisma.verificationDocument.findUnique({
            where: { id: verificationId },
            include: { user: true }
        });
        if (!verification) {
            return {
                success: false,
                message: 'Verification document not found'
            };
        }
        // Allow approving if status is PENDING or REJECTED
        if (verification.status !== 'PENDING' && verification.status !== 'REJECTED') {
            return {
                success: false,
                message: `Verification already ${verification.status.toLowerCase()}`
            };
        }
        // Update verification status to APPROVED
        const updatedVerification = yield prisma.verificationDocument.update({
            where: { id: verificationId },
            data: {
                status: 'APPROVED',
                rejectionReason: verification.status === 'REJECTED' ? null : verification.rejectionReason // Clear rejection reason if it exists
            }
        });
        // Update user's verification level to PURRPARENT
        yield prisma.user.update({
            where: { id: verification.userId },
            data: { verificationLevel: 'PURRPARENT' }
        });
        // Create notification for the user
        yield prisma.notification.create({
            data: {
                type: 'VERIFICATION',
                message: verification.status === 'REJECTED' ?
                    'Good news! Your previously rejected verification request has been reconsidered and approved. You are now a PurrParent.' :
                    'Your verification request has been approved! You are now a PurrParent.',
                receiverId: verification.userId,
                senderId: verification.userId // Self notification since it's system-generated
            }
        });
        // Send approval email to the user
        yield (0, emailService_1.sendVerificationApprovalEmail)(verification.user);
        return {
            success: true,
            message: verification.status === 'REJECTED' ?
                'Verification status reversed from rejected to approved' :
                'Verification approved successfully',
            data: updatedVerification
        };
    }
    catch (error) {
        console.error('Approve verification error:', error);
        return {
            success: false,
            message: 'Failed to approve verification'
        };
    }
});
exports.approveVerification = approveVerification;
const rejectVerification = (verificationId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the verification document
        const verification = yield prisma.verificationDocument.findUnique({
            where: { id: verificationId },
            include: { user: true }
        });
        if (!verification) {
            return {
                success: false,
                message: 'Verification document not found'
            };
        }
        // Allow rejecting if status is PENDING or APPROVED
        if (verification.status !== 'PENDING' && verification.status !== 'APPROVED') {
            return {
                success: false,
                message: `Verification already ${verification.status.toLowerCase()}`
            };
        }
        // If the verification was previously approved, also update the user's verification level
        if (verification.status === 'APPROVED') {
            yield prisma.user.update({
                where: { id: verification.userId },
                data: { verificationLevel: 'VERIFIED' } // Reset to regular VERIFIED status
            });
        }
        // Update verification status to REJECTED
        const updatedVerification = yield prisma.verificationDocument.update({
            where: { id: verificationId },
            data: {
                status: 'REJECTED',
                rejectionReason: reason
            }
        });
        // Create notification for the user
        yield prisma.notification.create({
            data: {
                type: 'VERIFICATION',
                message: `Your verification request has been rejected. Reason: ${reason}`,
                receiverId: verification.userId,
                senderId: verification.userId // Self notification since it's system-generated
            }
        });
        // Send rejection email to the user
        yield (0, emailService_1.sendVerificationRejectionEmail)(verification.user, reason);
        return {
            success: true,
            message: verification.status === 'APPROVED' ?
                'Verification status reversed from approved to rejected' :
                'Verification rejected successfully',
            data: updatedVerification
        };
    }
    catch (error) {
        console.error('Reject verification error:', error);
        return {
            success: false,
            message: 'Failed to reject verification'
        };
    }
});
exports.rejectVerification = rejectVerification;
// New function to create an admin user
const createAdmin = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if email already exists
        const existingUser = yield prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            return {
                success: false,
                message: 'Email already in use'
            };
        }
        // Check if username already exists
        const existingUsername = yield prisma.user.findUnique({
            where: { username: data.username }
        });
        if (existingUsername) {
            return {
                success: false,
                message: 'Username already in use'
            };
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(data.password, 10);
        // Create admin user
        const admin = yield prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                username: data.username,
                role: 'ADMIN',
                isEmailVerified: true, // Auto-verify admin accounts
                verificationLevel: 'VERIFIED', // Use VERIFIED instead of ADMIN
                profile: {
                    create: {} // Create an empty profile
                }
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                username: true,
                role: true,
                verificationLevel: true,
                createdAt: true
            }
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: admin.id, email: admin.email, role: admin.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' } // Longer expiry for testing
        );
        return {
            success: true,
            message: 'Admin user created successfully',
            data: {
                user: admin,
                token
            }
        };
    }
    catch (error) {
        console.error('Create admin error:', error);
        return {
            success: false,
            message: 'Failed to create admin user'
        };
    }
});
exports.createAdmin = createAdmin;
// Function to register a vet user by admin
const registerVet = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if email already exists
        const existingUser = yield prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            return {
                success: false,
                message: 'Email already in use'
            };
        }
        // Check if username already exists
        const existingUsername = yield prisma.user.findUnique({
            where: { username: data.username }
        });
        if (existingUsername) {
            return {
                success: false,
                message: 'Username already in use'
            };
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(data.password, 10);
        // Create vet user
        const vet = yield prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                username: data.username,
                role: 'VET',
                isEmailVerified: true, // Auto-verify vet accounts registered by admin
                verificationLevel: 'VET',
                profile: {
                    create: {} // Create an empty profile
                }
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                username: true,
                role: true,
                verificationLevel: true,
                createdAt: true
            }
        });
        return {
            success: true,
            message: 'Vet user registered successfully',
            data: {
                user: vet
            }
        };
    }
    catch (error) {
        console.error('Register vet error:', error);
        return {
            success: false,
            message: 'Failed to register vet user'
        };
    }
});
exports.registerVet = registerVet;
// Function to get all pending vet documents
const getPendingVetDocuments = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const vetDocuments = yield prisma.vetDocument.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profile: {
                            select: {
                                profilePictureUrl: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit + 1
        });
        const hasMore = vetDocuments.length > limit;
        const documentsToReturn = hasMore ? vetDocuments.slice(0, limit) : vetDocuments;
        return {
            success: true,
            message: 'Pending vet documents retrieved successfully',
            data: documentsToReturn,
            hasMore
        };
    }
    catch (error) {
        console.error('Get pending vet documents error:', error);
        return {
            success: false,
            message: 'Failed to retrieve pending vet documents',
            hasMore: false
        };
    }
});
exports.getPendingVetDocuments = getPendingVetDocuments;
// Function to approve a vet document
const approveVetDocument = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the vet document
        const vetDocument = yield prisma.vetDocument.findUnique({
            where: { id: documentId },
            include: { user: true }
        });
        if (!vetDocument) {
            return {
                success: false,
                message: 'Vet document not found'
            };
        }
        // Allow approving if status is PENDING or REJECTED
        if (vetDocument.status !== 'PENDING' && vetDocument.status !== 'REJECTED') {
            return {
                success: false,
                message: `Document already ${vetDocument.status.toLowerCase()}`
            };
        }
        // Update document status to APPROVED
        const updatedDocument = yield prisma.vetDocument.update({
            where: { id: documentId },
            data: {
                status: 'APPROVED',
                rejectionReason: vetDocument.status === 'REJECTED' ? null : vetDocument.rejectionReason // Clear rejection reason if it exists
            }
        });
        // If this is the first approved vet document, update user's role and verification level
        if (vetDocument.user.role !== 'VET') {
            yield prisma.user.update({
                where: { id: vetDocument.userId },
                data: {
                    role: 'VET',
                    verificationLevel: 'VET'
                }
            });
        }
        // Create notification for the user
        yield prisma.notification.create({
            data: {
                type: 'VERIFICATION',
                message: vetDocument.status === 'REJECTED' ?
                    'Your previously rejected veterinary document has been reconsidered and approved.' :
                    'Your veterinary document has been approved!',
                receiverId: vetDocument.userId,
                senderId: vetDocument.userId // Self notification since it's system-generated
            }
        });
        return {
            success: true,
            message: vetDocument.status === 'REJECTED' ?
                'Vet document status reversed from rejected to approved' :
                'Vet document approved successfully',
            data: updatedDocument
        };
    }
    catch (error) {
        console.error('Approve vet document error:', error);
        return {
            success: false,
            message: 'Failed to approve vet document'
        };
    }
});
exports.approveVetDocument = approveVetDocument;
// Function to reject a vet document
const rejectVetDocument = (documentId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the vet document
        const vetDocument = yield prisma.vetDocument.findUnique({
            where: { id: documentId },
            include: { user: true }
        });
        if (!vetDocument) {
            return {
                success: false,
                message: 'Vet document not found'
            };
        }
        // Allow rejecting if status is PENDING or APPROVED
        if (vetDocument.status !== 'PENDING' && vetDocument.status !== 'APPROVED') {
            return {
                success: false,
                message: `Document already ${vetDocument.status.toLowerCase()}`
            };
        }
        // Update document status to REJECTED
        const updatedDocument = yield prisma.vetDocument.update({
            where: { id: documentId },
            data: {
                status: 'REJECTED',
                rejectionReason: reason
            }
        });
        // Create notification for the user
        yield prisma.notification.create({
            data: {
                type: 'VERIFICATION',
                message: `Your veterinary document has been rejected. Reason: ${reason}`,
                receiverId: vetDocument.userId,
                senderId: vetDocument.userId // Self notification since it's system-generated
            }
        });
        return {
            success: true,
            message: vetDocument.status === 'APPROVED' ?
                'Vet document status reversed from approved to rejected' :
                'Vet document rejected successfully',
            data: updatedDocument
        };
    }
    catch (error) {
        console.error('Reject vet document error:', error);
        return {
            success: false,
            message: 'Failed to reject vet document'
        };
    }
});
exports.rejectVetDocument = rejectVetDocument;
// Function to get pending medical records
const getPendingMedicalRecords = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const medicalRecords = yield prisma.medicalRecord.findMany({
            where: {
                verificationStatus: 'PENDING'
            },
            include: {
                petProfile: {
                    select: {
                        id: true,
                        name: true,
                        species: true,
                        breed: true,
                        profilePicture: true,
                        owner: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                profile: {
                                    select: {
                                        profilePictureUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit + 1
        });
        const hasMore = medicalRecords.length > limit;
        const recordsToReturn = hasMore ? medicalRecords.slice(0, limit) : medicalRecords;
        return {
            success: true,
            message: 'Pending medical records retrieved successfully',
            data: recordsToReturn,
            hasMore
        };
    }
    catch (error) {
        console.error('Get pending medical records error:', error);
        return {
            success: false,
            message: 'Failed to retrieve pending medical records',
            hasMore: false
        };
    }
});
exports.getPendingMedicalRecords = getPendingMedicalRecords;
// Function to approve a medical record
const approveMedicalRecord = (recordId, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the medical record
        const medicalRecord = yield prisma.medicalRecord.findUnique({
            where: { id: recordId },
            include: {
                petProfile: {
                    include: {
                        owner: true
                    }
                }
            }
        });
        if (!medicalRecord) {
            return {
                success: false,
                message: 'Medical record not found'
            };
        }
        // Allow approving if status is PENDING or REJECTED
        if (medicalRecord.verificationStatus !== 'PENDING' && medicalRecord.verificationStatus !== 'REJECTED') {
            return {
                success: false,
                message: `Medical record already ${medicalRecord.verificationStatus.toLowerCase()}`
            };
        }
        // Update medical record status to APPROVED
        const updatedRecord = yield prisma.medicalRecord.update({
            where: { id: recordId },
            data: {
                verificationStatus: 'APPROVED',
                verifiedById: adminId,
                verifiedAt: new Date(),
                rejectionReason: null // Clear rejection reason if it exists
            }
        });
        // Create notification for the pet owner
        yield prisma.notification.create({
            data: {
                type: 'VERIFICATION',
                message: medicalRecord.verificationStatus === 'REJECTED' ?
                    `Your previously rejected medical record for ${medicalRecord.petProfile.name} has been reconsidered and approved.` :
                    `Your medical record for ${medicalRecord.petProfile.name} has been approved.`,
                receiverId: medicalRecord.petProfile.owner.id,
                senderId: adminId
            }
        });
        return {
            success: true,
            message: medicalRecord.verificationStatus === 'REJECTED' ?
                'Medical record status reversed from rejected to approved' :
                'Medical record approved successfully',
            data: updatedRecord
        };
    }
    catch (error) {
        console.error('Approve medical record error:', error);
        return {
            success: false,
            message: 'Failed to approve medical record'
        };
    }
});
exports.approveMedicalRecord = approveMedicalRecord;
// Function to reject a medical record
const rejectMedicalRecord = (recordId, adminId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the medical record
        const medicalRecord = yield prisma.medicalRecord.findUnique({
            where: { id: recordId },
            include: {
                petProfile: {
                    include: {
                        owner: true
                    }
                }
            }
        });
        if (!medicalRecord) {
            return {
                success: false,
                message: 'Medical record not found'
            };
        }
        // Allow rejecting if status is PENDING or APPROVED
        if (medicalRecord.verificationStatus !== 'PENDING' && medicalRecord.verificationStatus !== 'APPROVED') {
            return {
                success: false,
                message: `Medical record already ${medicalRecord.verificationStatus.toLowerCase()}`
            };
        }
        // Update medical record status to REJECTED
        const updatedRecord = yield prisma.medicalRecord.update({
            where: { id: recordId },
            data: {
                verificationStatus: 'REJECTED',
                verifiedById: adminId,
                verifiedAt: new Date(),
                rejectionReason: reason
            }
        });
        // Create notification for the pet owner
        yield prisma.notification.create({
            data: {
                type: 'VERIFICATION',
                message: `Your medical record for ${medicalRecord.petProfile.name} has been rejected. Reason: ${reason}`,
                receiverId: medicalRecord.petProfile.owner.id,
                senderId: adminId
            }
        });
        return {
            success: true,
            message: medicalRecord.verificationStatus === 'APPROVED' ?
                'Medical record status reversed from approved to rejected' :
                'Medical record rejected successfully',
            data: updatedRecord
        };
    }
    catch (error) {
        console.error('Reject medical record error:', error);
        return {
            success: false,
            message: 'Failed to reject medical record'
        };
    }
});
exports.rejectMedicalRecord = rejectMedicalRecord;
