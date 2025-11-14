import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';
import { error } from 'console';

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

// Define JWT payload interfaces for type safety
interface AccessTokenPayload { uid: number; }
interface RefreshTokenPayload { uid: number; }

/* JWT helper functions */
function signAccessToken(userId: number) {
  return jwt.sign({ uid: userId }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
}

function signRefreshToken(userId: number) {
  return jwt.sign({ uid: userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
}

// Helper to get the expiration date from a JWT for storing in the DB
function getExpirationDate(token: string): Date {
  const payload = jwt.decode(token) as { exp: number };
  return new Date(payload.exp * 1000);
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
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1,$2,$3,$4)
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
      const expiresAt = getExpirationDate(refreshToken);

      // Store the refresh token in its own table.
      await BaseService.query(
        `INSERT INTO refresh_token (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.user_id, refreshToken, expiresAt]
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

  /**
   * POST /auth/refresh
   * Securely rotates tokens.
   */
  async refreshToken(token: string): Promise<ServiceResult<any>> {
    const tokenRes = await BaseService.query('SELECT * FROM refresh_token WHERE token = $1', [token]);
    const storedToken = tokenRes.rows[0];

    if (!storedToken || storedToken.is_revoked) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Invalid or revoked refresh token')
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as RefreshTokenPayload;

      await BaseService.query('UPDATE refresh_token SET is_revoked = true WHERE token_id = $1', [storedToken.token_id]);

      const newAccessToken = signAccessToken(payload.uid);
      const newRefreshToken = signRefreshToken(payload.uid);
      const newExpiresAt = getExpirationDate(newRefreshToken);

      await BaseService.query(
        `INSERT INTO refresh_token (user_id, token, expires_at) VALUES ($1, $2, $3)`,
        [payload.uid, newRefreshToken, newExpiresAt]
      );

      return successResponse(SuccessCodes.OK, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (err) {
      await BaseService.query('UPDATE refresh_token SET is_revoked = true WHERE token_id = $1', [storedToken.token_id]);
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Invalid or revoked refresh token')
    }
  }
};