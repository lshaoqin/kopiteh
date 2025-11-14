import type { Request, Response } from 'express';
import type { MenuItemPayload, UpdateMenuItemPayload } from '../types/payloads';
import { MenuItemService } from '../services/menuItem.service';
import { BadRequestError } from './errors';
import { errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { validateCreateMenuItem, validateUpdateMenuItem } from '../validations/menuItem.validation';

export const MenuItemController = {
  async getAll(req: Request, res: Response) {
    const stallId = Number(req.params.stall_id);
    if (Number.isNaN(stallId))
      return res.status(400).json({ success: false, error: { message: 'Invalid stall_id' } });
    const result = await MenuItemService.findAllByStall(stallId);
    return res.status(result.payload.status).json(result);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ success: false, error: { message: 'Invalid id' } });
    const result = await MenuItemService.findById(id);
    return res.status(result.payload.status).json(result);
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body as MenuItemPayload;
      validateCreateMenuItem(payload);
      const result = await MenuItemService.create(payload);
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
      const payload = req.body as UpdateMenuItemPayload;
      validateUpdateMenuItem(payload);
      const result = await MenuItemService.update(id, payload);
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
    const result = await MenuItemService.delete(id);
    return res.status(result.payload.status).json(result);
  },
};
