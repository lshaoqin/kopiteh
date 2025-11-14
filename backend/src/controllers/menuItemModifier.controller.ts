import type { Request, Response } from 'express';
import type { MenuItemModifierPayload } from '../types/payloads';
import { MenuItemModifierService } from '../services/menuItemModifier.service';
import { BadRequestError } from './errors';
import { errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import {
  validateCreateMenuItemModifier,
  validateUpdateMenuItemModifier,
} from '../validations/menuItemModifier.validation';

export const MenuItemModifierController = {
  async getAll(req: Request, res: Response) {
    const itemId = Number(req.params.item_id);
    if (Number.isNaN(itemId))
      return res.status(400).json({ success: false, error: { message: 'Invalid item_id' } });
    const result = await MenuItemModifierService.findAllByItem(itemId);
    return res.status(result.payload.status).json(result);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ success: false, error: { message: 'Invalid id' } });
    const result = await MenuItemModifierService.findById(id);
    return res.status(result.payload.status).json(result);
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body as MenuItemModifierPayload;
      validateCreateMenuItemModifier(payload);
      const result = await MenuItemModifierService.create(payload);
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
      const payload = req.body as Partial<MenuItemModifierPayload>;
      validateUpdateMenuItemModifier(payload);
      const result = await MenuItemModifierService.update(id, payload);
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
    const result = await MenuItemModifierService.delete(id);
    return res.status(result.payload.status).json(result);
  },
};
