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
exports.deletePetProfile = exports.getUserPetProfiles = exports.updatePetProfile = exports.createPetProfile = void 0;
const index_1 = require("../index");
const createPetProfile = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return index_1.prisma.petProfile.create({
        data: Object.assign(Object.assign({}, data), { owner: {
                connect: { id: userId }
            } })
    });
});
exports.createPetProfile = createPetProfile;
const updatePetProfile = (userId, petId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const petProfile = yield index_1.prisma.petProfile.findFirst({
        where: {
            id: petId,
            ownerId: userId
        }
    });
    if (!petProfile) {
        return null;
    }
    return index_1.prisma.petProfile.update({
        where: { id: petId },
        data
    });
});
exports.updatePetProfile = updatePetProfile;
const getUserPetProfiles = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return index_1.prisma.petProfile.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' }
    });
});
exports.getUserPetProfiles = getUserPetProfiles;
const deletePetProfile = (userId, petId) => __awaiter(void 0, void 0, void 0, function* () {
    const petProfile = yield index_1.prisma.petProfile.findFirst({
        where: {
            id: petId,
            ownerId: userId
        }
    });
    if (!petProfile) {
        return false;
    }
    yield index_1.prisma.petProfile.delete({
        where: { id: petId }
    });
    return true;
});
exports.deletePetProfile = deletePetProfile;
