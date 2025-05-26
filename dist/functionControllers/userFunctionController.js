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
exports.getUserProfile = exports.updateAdoptionApplicationStatus = exports.getReceivedAdoptionApplications = exports.getMyAdoptionApplications = exports.applyForAdoption = exports.deletePetAdoptionPost = exports.getAllAdoptionPosts = exports.getUserAdoptionPosts = exports.createPetAdoptionPost = exports.applyForPurrparentVerification = exports.getSocialPost = exports.deleteSocialPost = exports.createSocialPost = exports.updateAddress = exports.changePassword = exports.updateProfileInfo = exports.deleteCoverPicture = exports.deleteProfilePicture = exports.uploadCoverPicture = exports.uploadProfilePicture = void 0;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const uploadProfilePicture = (userId, filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Delete old profile picture if exists
        const oldProfile = yield prisma.profile.findFirst({
            where: { userId }
        });
        if (oldProfile === null || oldProfile === void 0 ? void 0 : oldProfile.profilePictureUrl) {
            const oldPath = path_1.default.join(process.cwd(), oldProfile.profilePictureUrl);
            if (fs_1.default.existsSync(oldPath)) {
                fs_1.default.unlinkSync(oldPath);
            }
        }
        // Create or update profile picture
        const profile = yield prisma.profile.upsert({
            where: { id: (oldProfile === null || oldProfile === void 0 ? void 0 : oldProfile.id) || '' },
            update: { profilePictureUrl: filePath },
            create: {
                userId,
                profilePictureUrl: filePath
            }
        });
        return { success: true, data: profile };
    }
    catch (error) {
        throw new Error('Failed to upload profile picture');
    }
});
exports.uploadProfilePicture = uploadProfilePicture;
const uploadCoverPicture = (userId, filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Delete old cover picture if exists
        const oldCover = yield prisma.coverPicture.findFirst({
            where: { userId }
        });
        if (oldCover === null || oldCover === void 0 ? void 0 : oldCover.coverPictureUrl) {
            const oldPath = path_1.default.join(process.cwd(), oldCover.coverPictureUrl);
            if (fs_1.default.existsSync(oldPath)) {
                fs_1.default.unlinkSync(oldPath);
            }
        }
        // Create or update cover picture
        const cover = yield prisma.coverPicture.upsert({
            where: { id: (oldCover === null || oldCover === void 0 ? void 0 : oldCover.id) || '' },
            update: { coverPictureUrl: filePath },
            create: {
                userId,
                coverPictureUrl: filePath
            }
        });
        return { success: true, data: cover };
    }
    catch (error) {
        throw new Error('Failed to upload cover picture');
    }
});
exports.uploadCoverPicture = uploadCoverPicture;
const deleteProfilePicture = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = yield prisma.profile.findFirst({
            where: { userId }
        });
        if (profile === null || profile === void 0 ? void 0 : profile.profilePictureUrl) {
            const filePath = path_1.default.join(process.cwd(), profile.profilePictureUrl);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            yield prisma.profile.update({
                where: { id: profile.id },
                data: { profilePictureUrl: null }
            });
        }
        return { success: true, message: 'Profile picture deleted successfully' };
    }
    catch (error) {
        throw new Error('Failed to delete profile picture');
    }
});
exports.deleteProfilePicture = deleteProfilePicture;
const deleteCoverPicture = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cover = yield prisma.coverPicture.findFirst({
            where: { userId }
        });
        if (cover === null || cover === void 0 ? void 0 : cover.coverPictureUrl) {
            const filePath = path_1.default.join(process.cwd(), cover.coverPictureUrl);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            yield prisma.coverPicture.update({
                where: { id: cover.id },
                data: { coverPictureUrl: null }
            });
        }
        return { success: true, message: 'Cover picture deleted successfully' };
    }
    catch (error) {
        throw new Error('Failed to delete cover picture');
    }
});
exports.deleteCoverPicture = deleteCoverPicture;
const updateProfileInfo = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if username is being changed and if it's already taken
        if (data.username) {
            const existingUser = yield prisma.user.findFirst({
                where: {
                    username: data.username,
                    NOT: { id: userId }
                }
            });
            if (existingUser) {
                throw new Error('Username is already taken');
            }
        }
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                bio: data.bio,
                username: data.username
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                bio: true,
                email: true,
                isVerified: true,
                verificationLevel: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return { success: true, data: updatedUser };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Failed to update profile information');
    }
});
exports.updateProfileInfo = updateProfileInfo;
const changePassword = (userId, currentPassword, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get user with current password
        const user = yield prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Verify current password
        const isPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
        }
        // Hash new password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Update password
        yield prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        return { success: true, message: 'Password updated successfully' };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Failed to change password');
    }
});
exports.changePassword = changePassword;
const updateAddress = (userId, addressData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find existing address
        const existingAddress = yield prisma.fullAddress.findFirst({
            where: { userId }
        });
        let address;
        if (existingAddress) {
            // Update existing address
            address = yield prisma.fullAddress.update({
                where: { id: existingAddress.id },
                data: {
                    address: addressData.address,
                    city: addressData.city,
                    state: addressData.state,
                    zipCode: addressData.zipCode
                }
            });
        }
        else {
            // Create new address
            address = yield prisma.fullAddress.create({
                data: Object.assign(Object.assign({}, addressData), { userId })
            });
        }
        return { success: true, data: address };
    }
    catch (error) {
        throw new Error('Failed to update address');
    }
});
exports.updateAddress = updateAddress;
const createSocialPost = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verify that all tagged pets exist and belong to the user
        if (data.taggedPetIds && data.taggedPetIds.length > 0) {
            const taggedPets = yield prisma.petProfile.findMany({
                where: {
                    id: { in: data.taggedPetIds },
                    ownerId: userId
                }
            });
            if (taggedPets.length !== data.taggedPetIds.length) {
                throw new Error('One or more tagged pets not found or don\'t belong to you');
            }
        }
        // Create the post with images
        const post = yield prisma.socialPost.create({
            data: {
                content: data.content,
                authorId: userId,
                taggedPets: data.taggedPetIds ? {
                    connect: data.taggedPetIds.map(id => ({ id }))
                } : undefined,
                SocialPostImage: data.images ? {
                    create: data.images.map(imageUrl => ({
                        imageUrl
                    }))
                } : undefined
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        verificationLevel: true,
                        profile: {
                            select: {
                                profilePictureUrl: true
                            }
                        },
                        followers: {
                            select: {
                                followerId: true
                            }
                        }
                    }
                },
                taggedPets: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                },
                SocialPostImage: true,
                _count: {
                    select: {
                        reactions: true,
                        comments: true
                    }
                },
                reactions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
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
                    }
                }
            }
        });
        // Calculate if the post author is being followed by the current user
        const isFollowing = post.author.followers.some(follower => follower.followerId === userId);
        // Add isFollowing flag to the response
        const postWithFollowingStatus = Object.assign(Object.assign({}, post), { isFollowing, isVerified: ['VERIFIED', 'PURRPARENT', 'SUPER_ADOPTER', 'VET'].includes(post.author.verificationLevel) });
        return { success: true, data: postWithFollowingStatus };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Failed to create social post');
    }
});
exports.createSocialPost = createSocialPost;
const deleteSocialPost = (userId, postId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if post exists and belongs to user
        const post = yield prisma.socialPost.findFirst({
            where: {
                id: postId,
                authorId: userId
            },
            include: {
                SocialPostImage: true
            }
        });
        if (!post) {
            throw new Error('Post not found or you don\'t have permission to delete it');
        }
        // Delete associated images
        for (const image of post.SocialPostImage) {
            const imagePath = path_1.default.join(process.cwd(), image.imageUrl);
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
        }
        // Delete the post (this will cascade delete the images in the database)
        yield prisma.socialPost.delete({
            where: { id: postId }
        });
        return { success: true, message: 'Post deleted successfully' };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Failed to delete social post');
    }
});
exports.deleteSocialPost = deleteSocialPost;
const getSocialPost = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield prisma.socialPost.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profile: {
                            select: {
                                profilePictureUrl: true
                            }
                        }
                    }
                },
                taggedPets: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                },
                SocialPostImage: true,
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
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
                    }
                },
                reactions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                }
            }
        });
        if (!post) {
            throw new Error('Post not found');
        }
        return { success: true, data: post };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Failed to get social post');
    }
});
exports.getSocialPost = getSocialPost;
const applyForPurrparentVerification = (userId, documents) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if user already has a pending verification
        const existingVerification = yield prisma.verificationDocument.findFirst({
            where: {
                userId,
                status: 'PENDING'
            }
        });
        if (existingVerification) {
            throw new Error('You already have a pending verification request');
        }
        // Create single verification document with multiple files
        const verificationDoc = yield prisma.verificationDocument.create({
            data: {
                userId,
                documentType: documents[0].documentType, // Use the first document type as the main type
                status: 'PENDING',
                VerificationDocumentFile: {
                    create: documents.map(doc => ({
                        documentUrl: doc.documentUrl
                    }))
                }
            },
            include: {
                VerificationDocumentFile: true
            }
        });
        // Find an admin user
        const adminUser = yield prisma.user.findFirst({
            where: {
                role: 'ADMIN'
            }
        });
        if (adminUser) {
            // Create notification for admin
            yield prisma.notification.create({
                data: {
                    type: 'VERIFICATION',
                    message: 'New purrparent verification request received',
                    receiverId: adminUser.id,
                    senderId: userId
                }
            });
        }
        return {
            success: true,
            message: 'Purrparent verification request submitted successfully',
            data: verificationDoc
        };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Failed to submit purrparent verification request');
    }
});
exports.applyForPurrparentVerification = applyForPurrparentVerification;
const createPetAdoptionPost = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verify that the pet exists and belongs to the user if petProfileId is provided
        if (data.petProfileId) {
            const petProfile = yield prisma.petProfile.findFirst({
                where: {
                    id: data.petProfileId,
                    ownerId: userId
                }
            });
            if (!petProfile) {
                throw new Error('Pet not found or you don\'t have permission to create an adoption post for this pet');
            }
            // Update pet to mark as adoptable
            yield prisma.petProfile.update({
                where: { id: data.petProfileId },
                data: { isAdoptable: true }
            });
        }
        // Create the adoption post with images
        let adoptionPost;
        if (data.images && data.images.length > 0) {
            // First create the post
            const createData = {
                title: data.title,
                description: data.description,
                location: data.location,
                authorId: userId
            };
            // Only add petProfileId if it exists
            if (data.petProfileId) {
                createData.petProfileId = data.petProfileId;
            }
            adoptionPost = yield prisma.petAdoptionPost.create({
                data: createData,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            verificationLevel: true,
                            profile: {
                                select: {
                                    profilePictureUrl: true
                                }
                            }
                        }
                    },
                    petProfile: data.petProfileId ? {
                        select: {
                            id: true,
                            name: true,
                            species: true,
                            breed: true,
                            age: true,
                            gender: true,
                            size: true,
                            color: true,
                            description: true,
                            profilePicture: true
                        }
                    } : false
                }
            });
            // Then create images separately
            for (const imageUrl of data.images) {
                yield prisma.petAdoptionPostImage.create({
                    data: {
                        imageUrl,
                        petAdoptionPostId: adoptionPost.id
                    }
                });
            }
            // Fetch the post again with images
            adoptionPost = yield prisma.petAdoptionPost.findUnique({
                where: { id: adoptionPost.id },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            verificationLevel: true,
                            profile: {
                                select: {
                                    profilePictureUrl: true
                                }
                            }
                        }
                    },
                    petProfile: data.petProfileId ? {
                        select: {
                            id: true,
                            name: true,
                            species: true,
                            breed: true,
                            age: true,
                            gender: true,
                            size: true,
                            color: true,
                            description: true,
                            profilePicture: true
                        }
                    } : false,
                    PetAdoptionPostImage: true
                }
            });
        }
        else {
            // Create post without images
            const createData = {
                title: data.title,
                description: data.description,
                location: data.location,
                authorId: userId
            };
            // Only add petProfileId if it exists
            if (data.petProfileId) {
                createData.petProfileId = data.petProfileId;
            }
            adoptionPost = yield prisma.petAdoptionPost.create({
                data: createData,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            verificationLevel: true,
                            profile: {
                                select: {
                                    profilePictureUrl: true
                                }
                            }
                        }
                    },
                    petProfile: data.petProfileId ? {
                        select: {
                            id: true,
                            name: true,
                            species: true,
                            breed: true,
                            age: true,
                            gender: true,
                            size: true,
                            color: true,
                            description: true,
                            profilePicture: true
                        }
                    } : false,
                    PetAdoptionPostImage: true
                }
            });
        }
        return {
            success: true,
            message: 'Pet adoption post created successfully',
            data: adoptionPost
        };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Failed to create pet adoption post');
    }
});
exports.createPetAdoptionPost = createPetAdoptionPost;
const getUserAdoptionPosts = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const adoptionPosts = yield prisma.petAdoptionPost.findMany({
            where: {
                authorId: userId
            },
            include: {
                petProfile: {
                    select: {
                        id: true,
                        name: true,
                        species: true,
                        breed: true,
                        age: true,
                        gender: true,
                        size: true,
                        color: true,
                        profilePicture: true
                    }
                },
                PetAdoptionPostImage: true,
                _count: {
                    select: {
                        applications: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit + 1
        });
        const hasMore = adoptionPosts.length > limit;
        const postsToReturn = hasMore ? adoptionPosts.slice(0, limit) : adoptionPosts;
        return {
            success: true,
            message: 'Adoption posts retrieved successfully',
            data: postsToReturn,
            hasMore
        };
    }
    catch (error) {
        console.error('Get user adoption posts error:', error);
        return {
            success: false,
            message: 'Failed to get adoption posts',
            hasMore: false
        };
    }
});
exports.getUserAdoptionPosts = getUserAdoptionPosts;
const getAllAdoptionPosts = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const adoptionPosts = yield prisma.petAdoptionPost.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        verificationLevel: true,
                        profile: {
                            select: {
                                profilePictureUrl: true
                            }
                        }
                    }
                },
                petProfile: {
                    select: {
                        id: true,
                        name: true,
                        species: true,
                        breed: true,
                        age: true,
                        gender: true,
                        size: true,
                        color: true,
                        description: true,
                        profilePicture: true
                    }
                },
                PetAdoptionPostImage: true,
                _count: {
                    select: {
                        applications: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit + 1 // Fetch one extra to check if there are more posts
        });
        const hasMore = adoptionPosts.length > limit;
        const postsToReturn = hasMore ? adoptionPosts.slice(0, limit) : adoptionPosts;
        return {
            success: true,
            message: 'All adoption posts retrieved successfully',
            data: postsToReturn,
            hasMore
        };
    }
    catch (error) {
        console.error('Get all adoption posts error:', error);
        return {
            success: false,
            message: 'Failed to get adoption posts',
            hasMore: false
        };
    }
});
exports.getAllAdoptionPosts = getAllAdoptionPosts;
const deletePetAdoptionPost = (userId, postId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if post exists and belongs to user
        const post = yield prisma.petAdoptionPost.findFirst({
            where: {
                id: postId,
                authorId: userId
            },
            include: {
                PetAdoptionPostImage: true,
                petProfile: true
            }
        });
        if (!post) {
            throw new Error('Adoption post not found or you don\'t have permission to delete it');
        }
        // Delete associated images
        for (const image of post.PetAdoptionPostImage) {
            const imagePath = path_1.default.join(process.cwd(), image.imageUrl);
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
        }
        // Delete the post (this will cascade delete the images in the database)
        yield prisma.petAdoptionPost.delete({
            where: { id: postId }
        });
        // Check if pet has other adoption posts and if petProfileId exists
        if (post.petProfileId) {
            const otherPosts = yield prisma.petAdoptionPost.findFirst({
                where: {
                    petProfileId: post.petProfileId
                }
            });
            // If no other posts, mark pet as not adoptable
            if (!otherPosts) {
                yield prisma.petProfile.update({
                    where: { id: post.petProfileId },
                    data: { isAdoptable: false }
                });
            }
        }
        return {
            success: true,
            message: 'Adoption post deleted successfully'
        };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Failed to delete adoption post');
    }
});
exports.deletePetAdoptionPost = deletePetAdoptionPost;
const applyForAdoption = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Verify that the user has PURRPARENT verification level
        const user = yield prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.verificationLevel !== 'PURRPARENT' &&
            user.verificationLevel !== 'SUPER_ADOPTER' &&
            user.verificationLevel !== 'VET') {
            throw new Error('You must be a verified Purrparent to apply for adoption');
        }
        // Check if the adoption post exists
        const adoptionPost = yield prisma.petAdoptionPost.findUnique({
            where: { id: data.adoptionPostId },
            include: {
                author: true,
                petProfile: true
            }
        });
        if (!adoptionPost) {
            throw new Error('Adoption post not found');
        }
        // Check if the user is not applying to their own post
        if (adoptionPost.authorId === userId) {
            throw new Error('You cannot apply to adopt your own pet');
        }
        // Check if the user has already applied for this post
        const existingApplication = yield prisma.adoptionApplication.findFirst({
            where: {
                adoptionPostId: data.adoptionPostId,
                applicantId: userId,
                status: { in: ['PENDING', 'APPROVED'] }
            }
        });
        if (existingApplication) {
            throw new Error('You have already applied to adopt this pet');
        }
        // Create a chat room for the adoption conversation
        const chatRoom = yield prisma.chat.create({
            data: {
                name: `Adoption Chat - ${adoptionPost.title}`,
                ownerId: adoptionPost.authorId,
                participants: {
                    create: [
                        { userId: adoptionPost.authorId },
                        { userId: userId }
                    ]
                }
            }
        });
        // Create the adoption application
        const application = yield prisma.adoptionApplication.create({
            data: {
                message: data.message,
                applicantId: userId,
                petOwnerId: adoptionPost.authorId,
                adoptionPostId: data.adoptionPostId
            },
            include: {
                applicant: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        verificationLevel: true,
                        profile: {
                            select: {
                                profilePictureUrl: true
                            }
                        }
                    }
                },
                adoptionPost: {
                    include: {
                        petProfile: true
                    }
                }
            }
        });
        // Create notification for the pet owner
        yield prisma.notification.create({
            data: {
                type: 'PET_APPLICATION',
                message: `${user.firstName} ${user.lastName} has applied to adopt ${((_a = adoptionPost.petProfile) === null || _a === void 0 ? void 0 : _a.name) || 'your pet'}`,
                receiverId: adoptionPost.authorId,
                senderId: userId,
                entityId: application.id,
                entityType: 'ADOPTION_APPLICATION'
            }
        });
        return {
            success: true,
            message: 'Adoption application submitted successfully',
            data: Object.assign(Object.assign({}, application), { chatRoomId: chatRoom.id })
        };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Failed to apply for adoption');
    }
});
exports.applyForAdoption = applyForAdoption;
const getMyAdoptionApplications = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const applications = yield prisma.adoptionApplication.findMany({
            where: {
                applicantId: userId
            },
            include: {
                adoptionPost: {
                    include: {
                        petProfile: true,
                        PetAdoptionPostImage: {
                            take: 1
                        },
                        author: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true
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
        const hasMore = applications.length > limit;
        const applicationsToReturn = hasMore ? applications.slice(0, limit) : applications;
        return {
            success: true,
            message: 'Adoption applications retrieved successfully',
            data: applicationsToReturn,
            hasMore
        };
    }
    catch (error) {
        console.error('Get adoption applications error:', error);
        return {
            success: false,
            message: 'Failed to get adoption applications',
            hasMore: false
        };
    }
});
exports.getMyAdoptionApplications = getMyAdoptionApplications;
const getReceivedAdoptionApplications = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const applications = yield prisma.adoptionApplication.findMany({
            where: {
                petOwnerId: userId
            },
            include: {
                applicant: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        verificationLevel: true,
                        profile: {
                            select: {
                                profilePictureUrl: true
                            }
                        }
                    }
                },
                adoptionPost: {
                    include: {
                        petProfile: true,
                        PetAdoptionPostImage: {
                            take: 1
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
        const hasMore = applications.length > limit;
        const applicationsToReturn = hasMore ? applications.slice(0, limit) : applications;
        return {
            success: true,
            message: 'Received adoption applications retrieved successfully',
            data: applicationsToReturn,
            hasMore
        };
    }
    catch (error) {
        console.error('Get received adoption applications error:', error);
        return {
            success: false,
            message: 'Failed to get received adoption applications',
            hasMore: false
        };
    }
});
exports.getReceivedAdoptionApplications = getReceivedAdoptionApplications;
const updateAdoptionApplicationStatus = (userId, applicationId, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if the application exists and belongs to the user
        const application = yield prisma.adoptionApplication.findFirst({
            where: {
                id: applicationId,
                petOwnerId: userId
            },
            include: {
                applicant: true,
                adoptionPost: {
                    include: {
                        petProfile: true
                    }
                }
            }
        });
        if (!application) {
            throw new Error('Application not found or you don\'t have permission to update it');
        }
        if (application.status !== 'PENDING') {
            throw new Error('This application has already been processed');
        }
        // Update the application status
        const updatedApplication = yield prisma.adoptionApplication.update({
            where: { id: applicationId },
            data: {
                status: data.status,
                rejectionReason: data.status === 'REJECTED' ? data.rejectionReason : null
            },
            include: {
                applicant: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                },
                adoptionPost: {
                    include: {
                        petProfile: true
                    }
                }
            }
        });
        // Create notification for the applicant
        const petName = ((_a = application.adoptionPost.petProfile) === null || _a === void 0 ? void 0 : _a.name) || 'the pet';
        const notificationMessage = data.status === 'APPROVED'
            ? `Your application to adopt ${petName} has been approved!`
            : `Your application to adopt ${petName} has been rejected.`;
        yield prisma.notification.create({
            data: {
                type: 'APPLICATION_UPDATE',
                message: notificationMessage,
                receiverId: application.applicantId,
                senderId: userId,
                entityId: applicationId,
                entityType: 'ADOPTION_APPLICATION'
            }
        });
        // If approved, mark the post as inactive
        if (data.status === 'APPROVED') {
            yield prisma.petAdoptionPost.update({
                where: { id: application.adoptionPostId },
                data: { isActive: false }
            });
            // Reject all other pending applications for this post
            const otherApplications = yield prisma.adoptionApplication.findMany({
                where: {
                    adoptionPostId: application.adoptionPostId,
                    id: { not: applicationId },
                    status: 'PENDING'
                }
            });
            for (const otherApp of otherApplications) {
                yield prisma.adoptionApplication.update({
                    where: { id: otherApp.id },
                    data: {
                        status: 'REJECTED',
                        rejectionReason: 'Another applicant was selected for adoption'
                    }
                });
                // Notify other applicants
                yield prisma.notification.create({
                    data: {
                        type: 'APPLICATION_UPDATE',
                        message: `Your application to adopt ${petName} was rejected because another applicant was selected.`,
                        receiverId: otherApp.applicantId,
                        senderId: userId,
                        entityId: otherApp.id,
                        entityType: 'ADOPTION_APPLICATION'
                    }
                });
            }
        }
        return {
            success: true,
            message: `Application ${data.status.toLowerCase()} successfully`,
            data: updatedApplication
        };
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Failed to update application status');
    }
});
exports.updateAdoptionApplicationStatus = updateAdoptionApplicationStatus;
const getUserProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                coverPicture: true
            }
        });
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }
        // Remove sensitive information
        const { password } = user, userData = __rest(user, ["password"]);
        return {
            success: true,
            message: 'User profile retrieved successfully',
            data: userData
        };
    }
    catch (error) {
        console.error('Error retrieving user profile:', error);
        throw new Error('Failed to retrieve user profile');
    }
});
exports.getUserProfile = getUserProfile;
