"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = require("./index");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const mainRoutes_1 = __importDefault(require("./routes/mainRoutes"));
const petProfileRoutes_1 = __importDefault(require("./routes/petProfileRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/user', userRoutes_1.default);
app.use('/api/main', mainRoutes_1.default);
app.use('/api/pet', petProfileRoutes_1.default);
// Test database connection
index_1.prisma.$connect()
    .then(() => {
    console.log('Connected to MySQL database');
})
    .catch((error) => {
    console.error('Database connection error:', error);
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});
exports.default = app;
