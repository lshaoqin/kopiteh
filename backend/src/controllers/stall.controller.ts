import type { Request, Response } from 'express';
import type { StallPayload, UpdateStallPayload } from '../types/payloads';
import { StallService } from '../services/stall.service';
import { BadRequestError } from './errors';
import { errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { validateCreateStall, validateUpdateStall } from '../validations/stall.validation';

export const StallController = {
  async getAll(req: Request, res: Response) {
    const venueId = Number(req.params.venue_id);
    if (Number.isNaN(venueId))
      return res.status(400).json({ success: false, error: { message: 'Invalid venue_id' } });
    const result = await StallService.findAllByVenue(venueId);
    return res.status(result.payload.status).json(result);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ success: false, error: { message: 'Invalid id' } });
    const result = await StallService.findById(id);
    return res.status(result.payload.status).json(result);
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body as StallPayload;
      validateCreateStall(payload);
      const result = await StallService.create(payload);
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        const result = errorResponse(ErrorCodes.VALIDATION_ERROR, String(err.details));
        return res.status(result.payload.status).json(result);
      }
      const result = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(result.payload.status).json(result);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ success: false, error: { message: 'Invalid id' } });
      const payload = req.body as UpdateStallPayload;
      validateUpdateStall(payload);
      const result = await StallService.update(id, payload);
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        const result = errorResponse(ErrorCodes.VALIDATION_ERROR, String(err.details));
        return res.status(result.payload.status).json(result);
      }
      const result = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(result.payload.status).json(result);
    }
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ success: false, error: { message: 'Invalid id' } });
    const result = await StallService.delete(id);
    return res.status(result.payload.status).json(result);
  },
};
