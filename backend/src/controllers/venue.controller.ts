import type { Request, Response } from 'express';
import type { VenuePayload, UpdateVenuePayload } from '../types/payloads';
import { VenueService } from '../services/venue.service';
import { BadRequestError } from './errors';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';
import { validateCreateVenue, validateUpdateVenue } from '../validations/venue.validation';

export const VenueController = {
  async getAll(req: Request, res: Response) {
    const result = await VenueService.findAll();
    return res.status(result.payload.status).json(result);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ success: false, error: { message: 'Invalid id' } });
    const result = await VenueService.findById(id);
    return res.status(result.payload.status).json(result);
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body as VenuePayload;
      validateCreateVenue(payload);
      const result = await VenueService.create(payload);
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        return errorResponse(ErrorCodes.VALIDATION_ERROR, String(err.details));
      }
      return errorResponse(ErrorCodes.INTERNAL_ERROR);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ success: false, error: { message: 'Invalid id' } });
      const payload = req.body as UpdateVenuePayload;
      validateUpdateVenue(payload);
      const result = await VenueService.update(id, payload);
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        return errorResponse(ErrorCodes.VALIDATION_ERROR, String(err.details));
      }
      return errorResponse(ErrorCodes.INTERNAL_ERROR);
    }
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ success: false, error: { message: 'Invalid id' } });
    const result = await VenueService.delete(id);
    if (!result.success) {
      return res.status(result.payload.status).json(result);
    }
    return res.status(result.payload.status).json(result);
  }
};
