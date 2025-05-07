import { Router } from "express";
import { handleAdminLogin } from "../httpControllers/adminHttpController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

// Admin authentication routes
router.post('/login', handleAdminLogin);

export default router;

