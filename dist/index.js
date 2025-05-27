"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const mainRoutes_1 = __importDefault(require("./routes/mainRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const petRoutes_1 = __importDefault(require("./routes/petRoutes"));
const vetRoutes_1 = __importDefault(require("./routes/vetRoutes"));
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
// Create HTTP server
const server = http_1.default.createServer(app);
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/pet', petRoutes_1.default);
app.use('/api', mainRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
app.use('/api/vet', vetRoutes_1.default);
app.get('/', (req, res) => {
    res.send('API is running!');
});
const PORT = Number(process.env.PORT) || 6601;
const HOST = '0.0.0.0';
// Start the server
server.listen(PORT, () => {
    console.log(`🚀 Server is running at http://${HOST}:${PORT}`);
    console.log(`🔌 WebSocket server is running on the same port`);
});
