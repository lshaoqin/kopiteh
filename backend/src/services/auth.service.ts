import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';
import { CreateAccountPayload, LoginPayload, VerifyEmailPayload } from '../types/payloads';

function generateSecretCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* JWT helper functions */
function signAccessToken(userId: number) {
  return jwt.sign({ uid: userId }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
}

function signRefreshToken(userId: number) {
  return jwt.sign({ uid: userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
}

export const AuthService = {
  /** 
   * POST /auth/create-account 
   * Creates a new user, hashes password, inserts into DB
   */
  async createAccount(payload: CreateAccountPayload): Promise<ServiceResult<User>> {
    try {
      // Check if email already exists
      const existing = await BaseService.query('SELECT 1 FROM users WHERE email = $1', [payload.email]);
      if (existing.rowCount && existing.rows[0]) {
        return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Email already registered');
      }

      const hash = await bcrypt.hash(payload.password, 10);
      const verifyCode = generateSecretCode();
      const verifyExpiry = new Date(Date.now() + 15 * 60 * 1000);
      const createdAt = new Date(Date.now());
      const created = await BaseService.query(
        `INSERT INTO users (name, email, password_hash, role, is_authenticated, created_at, verify_code, verify_code_expires_at)
         VALUES ($1,$2,$3,$4,false,$5,$6,$7)
         RETURNING user_id, name, email, role, is_authenticated, created_at`,
        [payload.name, payload.email, hash, payload.role, createdAt, verifyCode, verifyExpiry]
      );
      
      const user = created.rows[0]

      return successResponse(SuccessCodes.CREATED, {
        message: 'Account created. Please check your email for the verification code.',
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_authenticated: user.is_authenticated,
          created_at: user.created_at
        },
      });
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  

  /** 
   * POST /auth/account-login 
   * Verifies credentials, generates JWT access/refresh tokens
   */
  async login(payload: LoginPayload): Promise<ServiceResult<any>> {
    try {
      const userRes = await BaseService.query(
        `SELECT user_id, name, email, role, password_hash 
           FROM users WHERE email = $1`,
        [payload.email]
      );
      const user = userRes.rows[0];
      if (!user) return errorResponse(ErrorCodes.NOT_FOUND, 'User not found');

      const validPassword = await bcrypt.compare(payload.password, user.password_hash);
      if (!validPassword) return errorResponse(ErrorCodes.UNAUTHORIZED, 'Invalid credentials');

      const accessToken = signAccessToken(user.user_id);
      const refreshToken = signRefreshToken(user.user_id);

      await BaseService.query(
        `UPDATE users
           SET is_authenticated = true,
               access_token = $1,
               refresh_token = $2
         WHERE user_id = $3`,
        [accessToken, refreshToken, user.user_id]
      );

      return successResponse(SuccessCodes.OK, {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async verifyEmail(payload: VerifyEmailPayload): Promise<ServiceResult<any>> {
     try {
      const res = await BaseService.query(
        `SELECT user_id, name, email, role, is_authenticated, created_at, verify_code, verify_code_expires_at
         FROM users
         WHERE email = $1`,
        [payload.email]
      );

      const user = res.rows[0];
      if (!user) {
        return errorResponse(ErrorCodes.NOT_FOUND, 'User not found');
      }

      if (user.is_authenticated) {
        // Already verified; you might still want to return tokens here or not.
        const accessToken = signAccessToken(user.user_id);
        const refreshToken = signRefreshToken(user.user_id);
        return successResponse(SuccessCodes.OK, {
          message: 'Email already verified',
          access_token: accessToken,
          refresh_token: refreshToken,
          user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_authenticated: user.is_authenticated,
            created_at: user.created_at
          },
        });
      }

      if (!user.verify_code || !user.verify_code_expires_at) {
        return errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'No verification code set'
        );
      }

      const now = new Date();
      const expiresAt = new Date(user.verify_code_expires_at);

      if (now > expiresAt) {
        return errorResponse(
          ErrorCodes.UNAUTHORIZED,
          'Verification code expired'
        );
      }

      if (payload.code !== user.verify_code) {
        return errorResponse(
          ErrorCodes.UNAUTHORIZED,
          'Invalid verification code'
        );
      }

      // Code is valid → mark user as authenticated and clear code
      await BaseService.query(
        `UPDATE users
           SET is_authenticated = true,
               verify_code = NULL,
               verify_code_expires_at = NULL
         WHERE user_id = $1`,
        [user.user_id]
      );

      const accessToken = signAccessToken(user.user_id);
      const refreshToken = signRefreshToken(user.user_id);

      return successResponse(SuccessCodes.OK, {
        message: 'Email verified successfully',
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_authenticated: true
        },
      });
    } catch (error) {
      return errorResponse(
        ErrorCodes.DATABASE_ERROR,
        String(error)
      );
    }
  },

  

  /** 
   * GET /auth/auth-check 
   * Verifies if access token is valid and not expired
   */
  async authCheck(bearerToken?: string): Promise<ServiceResult<any>> {
    try {
      if (!bearerToken) {
        return successResponse(SuccessCodes.OK, { isAuthenticated: false });
      }

      const token = bearerToken.startsWith('Bearer ')
        ? bearerToken.slice('Bearer '.length)
        : bearerToken;

      try {
        jwt.verify(token, process.env.JWT_SECRET as string);
        return successResponse(SuccessCodes.OK, { isAuthenticated: true });
      } catch {
        // Invalid or expired token
        return successResponse(SuccessCodes.OK, { isAuthenticated: false });
      }
    } catch (error) {
      return errorResponse(ErrorCodes.INTERNAL_ERROR, String(error));
    }
  },
};