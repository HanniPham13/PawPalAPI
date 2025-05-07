import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import path from 'path';
import http from 'http';
import mainRoutes from './routes/mainRoutes';
import adminRouter from './routes/adminRoutes';
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



// Routes
// app.use('/api/pet', petRoutes);
// app.use('/api/user', userRoutes);
app.use('/api', mainRoutes);
app.use('/api/admin', adminRouter);
app.get('/', (req: Request, res: Response) => {
  res.send('API is running!');
});

const PORT: number = 7700;
const HOST: string = '0.0.0.0';


// Start the server
server.listen(PORT, (): void => {
  console.log(`🚀 Server is running at http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket server is running on the same port`);
});
