import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';

export interface CreateAccountPayload {
  name: string;
  email: string;
  password: string;
  role: string; // e.g. "admin" | "user"
}

export interface LoginPayload {
  email: string;
  password: string;
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
  async createAccount(payload: CreateAccountPayload): Promise<ServiceResult<any>> {
    try {
      // Check if email already exists
      const existing = await BaseService.query('SELECT 1 FROM users WHERE email = $1', [payload.email]);
      if (existing.rowCount && existing.rows[0]) {
        return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Email already registered');
      }

      const hash = await bcrypt.hash(payload.password, 10);
      const created = await BaseService.query(
        `INSERT INTO users (name, email, password_hash, role, is_authenticated)
         VALUES ($1,$2,$3,$4,false)
         RETURNING user_id, name, email, role`,
        [payload.name, payload.email, hash, payload.role]
      );

      return successResponse(SuccessCodes.CREATED, created.rows[0]);
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