import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import path from 'path';
import http from 'http';
import mainRoutes from './routes/mainRoutes';
import adminRouter from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import petRoutes from './routes/petRoutes';
import vetRoutes from './routes/vetRoutes';

const app = express();

export const prisma = new PrismaClient();

// Create HTTP server
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/pet', petRoutes);
app.use('/api', mainRoutes);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRoutes);
app.use('/api/vet', vetRoutes);
app.get('/', (req: Request, res: Response) => {
  res.send('API is running!');
});

const PORT: number = 6600;
const HOST: string = '0.0.0.0';


// Start the server
server.listen(PORT, (): void => {
  console.log(`🚀 Server is running at http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket server is running on the same port`);
});
