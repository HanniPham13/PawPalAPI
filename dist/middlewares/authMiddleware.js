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
exports.vetOnly = exports.adminOnly = exports.verifiedOnly = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const client_1 = require("@prisma/client");
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = yield index_1.prisma.user.findUnique({
            where: { id: decoded.id }
        });
        if (!user) {
            res.status(401).json({ success: false, message: 'User not found' });
            return;
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});
exports.authenticate = authenticate;
const verifiedOnly = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
    }
    // Check if user is verified using Prisma
    index_1.prisma.user.findUnique({
        where: { id: req.user.id }
    }).then(user => {
        if (!user || !user.isVerified) {
            res.status(403).json({ success: false, message: 'Email verification required' });
            return;
        }
        next();
    }).catch(() => {
        res.status(500).json({ success: false, message: 'Server error' });
    });
};
exports.verifiedOnly = verifiedOnly;
// Admin only middleware
const adminOnly = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== client_1.UserRole.ADMIN) {
        res.status(403).json({ success: false, message: 'Unauthorized. Admin access only.' });
        return;
    }
    next();
};
exports.adminOnly = adminOnly;
// Vet only middleware
const vetOnly = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== client_1.UserRole.VET) {
        res.status(403).json({ success: false, message: 'Unauthorized. Vet access only.' });
        return;
    }
    next();
};
exports.vetOnly = vetOnly;
