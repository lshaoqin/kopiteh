import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import {
  createAccountValidation,
  loginValidation,
  runValidation,
} from '../middleware/auth.validation';

const router = Router();

// Public routes (no auth needed)
router.post('/auth/create-account', createAccountValidation, runValidation, AuthController.createAccount);
router.post('/auth/account-login', loginValidation, runValidation, AuthController.login);
router.get('/auth/auth-check', AuthController.authCheck);
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.post('/auth/verify-reset-code', AuthController.verifyResetCode);
router.post('/auth/reset-password', AuthController.resetPassword);
router.post('/auth/refresh', AuthController.refreshToken);
router.post('/auth/logout', AuthController.logout);

export default router;
