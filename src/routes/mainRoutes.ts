import { Router } from 'express';
import { 
  handleRegister, 
  handleVerifyEmail, 
  handleResendVerification, 
  handleRequestPasswordReset, 
  handleResetPassword,
  handleLogin 
} from '../httpControllers/mainHttpController';
import { authenticate, verifiedOnly } from '../middlewares/authMiddleware';

const router = Router();

// Authentication routes
router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.post('/verify-email', handleVerifyEmail);
router.post('/resend-verification', handleResendVerification);
router.post('/forgot-password', handleRequestPasswordReset);
router.post('/reset-password',authenticate, handleResetPassword);

export default router;