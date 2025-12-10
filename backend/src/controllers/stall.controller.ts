import type { Request, Response } from "express";
import type { StallPayload, UpdateStallPayload } from "../types/payloads";
import { StallService } from "../services/stall.service";
import { BadRequestError } from "./errors";
import { errorResponse, successResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";
import { SuccessCodes } from "../types/success";
import {
  validateCreateStall,
  validateUpdateStall,
} from "../validations/stall.validation";

export const StallController = {
  async getAll(req: Request, res: Response) {
    try {
      const venueId = Number(req.params.venue_id);
      if (Number.isNaN(venueId)) {
        const r = errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          "Invalid venue_id parameter"
        );
        return res.status(r.payload.status).json(r);
      }

      const result = await StallService.findAllByVenue(venueId);
      return res.status(result.payload.status).json(result);
    } catch (_err) {
      const r = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(r.payload.status).json(r);
    }
  },

  // GET /stalls/:id
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        const r = errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          "Invalid id parameter"
        );
        return res.status(r.payload.status).json(r);
      }

      const result = await StallService.findById(id);
      return res.status(result.payload.status).json(result);
    } catch (_err) {
      const r = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(r.payload.status).json(r);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body as StallPayload;
      validateCreateStall(payload);
      const data = await StallService.create(payload);
      const result = successResponse(SuccessCodes.OK, data);
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        const result = errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          String(err.details)
        );
        return res.status(result.payload.status).json(result);
      }
      const result = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(result.payload.status).json(result);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const payload = req.body as UpdateStallPayload;
      validateUpdateStall(payload);
      const data = await StallService.update(id, payload);
      const result = successResponse(SuccessCodes.OK, data);
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        const result = errorResponse(
          ErrorCodes.VALIDATION_ERROR,
          String(err.details)
        );
        return res.status(result.payload.status).json(result);
      }
      const result = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(result.payload.status).json(result);
    }
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = await StallService.delete(id);
    const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },
};
