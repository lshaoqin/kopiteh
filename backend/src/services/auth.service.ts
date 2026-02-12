import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { ServiceResult } from "../types/responses";
import { BaseService } from "./base.service";
import { successResponse, errorResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";
import { SuccessCodes } from "../types/success";
import crypto from "crypto";
import sgMail from "@sendgrid/mail";

import {
  CreateAccountPayload,
  LoginPayload,
  ForgotPasswordPayload,
  RefreshTokenPayload,
  LogoutPayload,
} from "../types/payloads";

/* JWT helper functions */
function signAccessToken(userId: number) {
  return jwt.sign({ uid: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });
}

function signRefreshToken(userId: number, sessionId: string) {
  return jwt.sign(
    { user_id: userId, session_id: sessionId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "30d" }
  );
}

function hashRefreshToken(token: string) {
  return bcrypt.hash(token, 10);
}

function compareRefreshToken(token: string, hash: string) {
  return bcrypt.compare(token, hash);
}

function generateSessionId(): string {
  return crypto.randomUUID();
}

async function createSessionWithId(
  userId: number,
  sessionId: string,
  refreshToken: string
): Promise<void> {
  try {
    console.log("[createSessionWithId] called with:", { userId, sessionId });

    const hashed = await hashRefreshToken(refreshToken);

    const result = await BaseService.query(
      `INSERT INTO user_sessions (user_session_id, user_id, refresh_token_hash)
       VALUES ($1, $2, $3)
       RETURNING user_session_id, user_id, created_at`,
      [sessionId, userId, hashed]
    );

    console.log("[createSessionWithId] insert OK:", result.rows[0]);
  } catch (err) {
    console.error("[createSessionWithId] ERROR inserting session:", err);
    throw err;
  }
}

export const AuthService = {
  async createAccount(
    payload: CreateAccountPayload
  ): Promise<ServiceResult<any>> {
    try {
      const adminCode = process.env.ADMIN_SIGNUP_CODE;
      const role = "admin";

      if (payload.secretCode !== adminCode) {
        return errorResponse(ErrorCodes.UNAUTHORIZED, "Invalid signup code");
      }

      const existing = await BaseService.query(
        "SELECT 1 FROM users WHERE email = $1",
        [payload.email]
      );
      if (existing.rowCount && existing.rows[0]) {
        return errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          "Email already registered"
        );
      }

      const hash = await bcrypt.hash(payload.password, 10);
      const createdAt = new Date(Date.now());
      const created = await BaseService.query(
        `INSERT INTO users (name, email, password_hash, role, is_authenticated, created_at)
         VALUES ($1,$2,$3,$4,true,$5)
         RETURNING user_id, name, email, role, is_authenticated, created_at`,
        [payload.name, payload.email, hash, role, createdAt]
      );

      const user = created.rows[0];

      const accessToken = signAccessToken(user.user_id);

      const sessionId = generateSessionId();
      const refreshToken = signRefreshToken(user.user_id, sessionId);
      await createSessionWithId(user.user_id, sessionId, refreshToken);

      return successResponse(SuccessCodes.CREATED, {
        message: "Account created successfully.",
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_authenticated: user.is_authenticated,
          created_at: user.created_at,
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
        `SELECT user_id, name, email, role, password_hash, is_authenticated, verify_code_expires_at
          FROM users
          WHERE email = $1`,
        [payload.email]
      );
      const user = userRes.rows[0];
      if (!user) return errorResponse(ErrorCodes.NOT_FOUND, "User not found");

      const validPassword = await bcrypt.compare(
        payload.password,
        user.password_hash
      );
      if (!validPassword)
        return errorResponse(ErrorCodes.UNAUTHORIZED, "Invalid credentials");

      const accessToken = signAccessToken(user.user_id);

      // Refresh Token logic -- stored in user_sessions table
      const sessionId = generateSessionId();
      const refreshToken = signRefreshToken(user.user_id, sessionId);
      await createSessionWithId(user.user_id, sessionId, refreshToken);

      return successResponse(SuccessCodes.OK, {
        message: "Login success!",
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_authenticated: user.is_authenticated,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async logout(payload: LogoutPayload): Promise<ServiceResult<any>> {
    const { refreshToken } = payload;

    try {
      if (!refreshToken) {
        return errorResponse(ErrorCodes.UNAUTHORIZED, "Missing refresh token");
      }

      // Decode refresh token to get session_id
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      ) as { user_id: number; session_id: string };

      const { session_id } = decoded;

      // Delete the session
      await BaseService.query(
        `DELETE FROM user_sessions WHERE user_session_id = $1`,
        [session_id]
      );

      return successResponse(SuccessCodes.OK, {
        message: "Successfully logged out",
      });
    } catch (err) {
      return errorResponse(
        ErrorCodes.UNAUTHORIZED,
        "Invalid or expired refresh token"
      );
    }
  },

  async forgotPassword(
    payload: ForgotPasswordPayload
  ): Promise<ServiceResult<any>> {
    const { email, name, newPassword } = payload;

    try {
      const userRes = await BaseService.query(
        `SELECT user_id, name
       FROM users
       WHERE email = $1`,
        [email]
      );

      const user = userRes.rows[0];

      if (!user) {
        return errorResponse(ErrorCodes.NOT_FOUND, "User not found");
      }

      if (user.name !== name) {
        return errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          "Name does not match our records"
        );
      }

      // update the user password
      const hash = await bcrypt.hash(newPassword, 10);

      await BaseService.query(
        `UPDATE users
          SET password_hash = $1,
           reset_password_code = NULL,
           reset_password_expires_at = NULL
        WHERE user_id = $2`,
        [hash, user.user_id]
      );

      return successResponse(SuccessCodes.OK, {
        message: "Password has been reset successfully. Please log in again.",
      });
    } catch (error) {
      console.error("[AuthService.forgotPassword] DB error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async authCheck(bearerToken?: string): Promise<ServiceResult<any>> {
    try {
      if (!bearerToken) {
        return successResponse(SuccessCodes.OK, { isAuthenticated: false });
      }

      const token = bearerToken.startsWith("Bearer ")
        ? bearerToken.slice("Bearer ".length)
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

  async refreshToken(
    payload: RefreshTokenPayload
  ): Promise<ServiceResult<any>> {
    const { refreshToken } = payload;

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      ) as { user_id: number; session_id: string; iat: number; exp: number };

      const { user_id, session_id } = decoded;

      const sessionRes = await BaseService.query(
        `SELECT refresh_token_hash FROM user_sessions WHERE user_session_id = $1`,
        [session_id]
      );
      const session = sessionRes.rows[0];
      if (!session) {
        return errorResponse(
          ErrorCodes.UNAUTHORIZED,
          "Session not found or has been revoked"
        );
      }

      const match = await compareRefreshToken(
        refreshToken,
        session.refresh_token_hash
      );
      if (!match) {
        return errorResponse(ErrorCodes.UNAUTHORIZED, "Invalid refresh token");
      }

      // rotate tokens
      const newAccessToken = signAccessToken(user_id);
      const newRefreshToken = signRefreshToken(user_id, session_id);
      const newHash = await hashRefreshToken(newRefreshToken);

      await BaseService.query(
        `UPDATE user_sessions
         SET refresh_token_hash = $1
       WHERE user_session_id = $2`,
        [newHash, session_id]
      );

      //user details
      const res = await BaseService.query(
        `SELECT user_id, name, email, role, is_authenticated, created_at
       FROM users
       WHERE user_id = $1`,
        [user_id]
      );
      const user = res.rows[0];

      return successResponse(SuccessCodes.OK, {
        message: "Tokens refreshed",
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_authenticated: user.is_authenticated,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      return errorResponse(
        ErrorCodes.UNAUTHORIZED,
        "Invalid or expired refresh token"
      );
    }
  },
};
