import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import {
  createAccountValidation,
  loginValidation,
  forgotPasswordValidation,
  runValidation,
} from '../middleware/auth.validation';

const router = Router();

router.post('/auth/create-account', createAccountValidation, runValidation, AuthController.createAccount);
router.post('/auth/account-login', loginValidation, runValidation, AuthController.login);
router.get('/auth/auth-check', AuthController.authCheck);
router.post('/auth/forgot-password', forgotPasswordValidation, runValidation, AuthController.forgotPassword);
router.post('/auth/refresh', AuthController.refreshToken);
router.post('/auth/logout', AuthController.logout);

export default router;
