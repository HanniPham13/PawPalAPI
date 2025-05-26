import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './index';
import userRoutes from './routes/userRoutes';
import mainRoutes from './routes/mainRoutes';
import petProfileRoutes from './routes/petProfileRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/main', mainRoutes);
app.use('/api/pet', petProfileRoutes);

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('Connected to MySQL database');
  })
  .catch((error: Error) => {
    console.error('Database connection error:', error);
  });

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

export default app; 