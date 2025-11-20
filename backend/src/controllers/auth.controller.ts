// src/controllers/auth.controller.ts
import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import {
  CreateAccountPayload,
  LoginPayload,
  VerifyEmailPayload,
  ForgotPasswordPayload,
  VerifyResetCodePayload,
  ResetPasswordPayload
} from "../types/payloads";
import { BadRequestError } from "./errors";
import { errorResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";

export const AuthController = {
  // POST /auth/create-account
  async createAccount(req: Request, res: Response) {
    try {
      const payload: CreateAccountPayload = req.body;
      const result = await AuthService.createAccount(payload);
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        const r = errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          String(err.details)
        );
        return res.status(r.payload.status).json(r);
      }
      const r = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(r.payload.status).json(r);
    }
  },

  // POST /auth/account-login
  async login(req: Request, res: Response) {
    try {
      const payload = req.body as LoginPayload;
      const result = await AuthService.login(payload);
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        const r = errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          String(err.details)
        );
        return res.status(r.payload.status).json(r);
      }
      const r = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(r.payload.status).json(r);
    }
  },

  // GET /auth/auth-check
  async authCheck(req: Request, res: Response) {
    try {
      const bearer = req.headers.authorization ?? undefined; // e.g. "Bearer abc..."
      const result = await AuthService.authCheck(bearer);
      return res.status(result.payload.status).json(result);
    } catch (_err) {
      const r = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(r.payload.status).json(r);
    }
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const payload = req.body as VerifyEmailPayload;
      const result = await AuthService.verifyEmail(payload);
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        const r = errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          String(err.details)
        );
        return res.status(r.payload.status).json(r);
      }
      const r = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(r.payload.status).json(r);
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const payload: ForgotPasswordPayload = {
        email: req.body.email,
      };

      const result = await AuthService.forgotPassword(payload);
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        const r = errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          String(err.details)
        );
        return res.status(r.payload.status).json(r);
      }
      const r = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(r.payload.status).json(r);
    }
  },

  async verifyResetCode(req: Request, res: Response) {
    try {
      const payload: VerifyResetCodePayload = {
        email: req.body.email,
        code: req.body.code,
      };

      const result = await AuthService.verifyResetCode(payload);
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        const r = errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          String(err.details)
        );
        return res.status(r.payload.status).json(r);
      }
      const r = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(r.payload.status).json(r);
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const payload: ResetPasswordPayload = {
        email: req.body.email,
        code: req.body.code,
        newPassword: req.body.newPassword,
      };

      const result = await AuthService.resetPassword(payload);
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        const r = errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          String(err.details)
        );
        return res.status(r.payload.status).json(r);
      }
      const r = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(r.payload.status).json(r);
    }
  },

  // POST /auth/refresh   (requires AuthService.refreshToken to be implemented)
  async refreshToken(req: Request, res: Response) {
    try {
      // accept refresh token via Authorization header or body.refresh_token
      const bearer = req.headers.authorization;
      const tokenFromHeader = bearer?.startsWith("Bearer ")
        ? bearer.slice("Bearer ".length)
        : undefined;
      const refreshToken =
        tokenFromHeader ?? (req.body?.refresh_token as string | undefined);

      if (!refreshToken) {
        const r = errorResponse(
          ErrorCodes.UNAUTHORIZED,
          "Missing refresh token"
        );
        return res.status(r.payload.status).json(r);
      }

      // @ts-expect-error: define AuthService.refreshToken if you haven't yet
      const result = await AuthService.refreshToken(refreshToken);
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        const r = errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          String(err.details)
        );
        return res.status(r.payload.status).json(r);
      }
      const r = errorResponse(
        ErrorCodes.UNAUTHORIZED,
        "Invalid or expired refresh token"
      );
      return res.status(r.payload.status).json(r);
    }
  },
};
