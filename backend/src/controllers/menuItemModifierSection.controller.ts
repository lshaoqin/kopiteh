import type { Request, Response } from 'express';
import type { MenuItemModifierSectionPayload } from '../types/payloads';
import { MenuItemModifierSectionService } from '../services/menuItemModifierSection.service';
import { BadRequestError } from './errors';
import { errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import {
  validateCreateMenuItemModifierSection,
  validateUpdateMenuItemModifierSection,
} from '../validations/menuItemModifierSection.validation';

export const MenuItemModifierSectionController = {
  async getAll(req: Request, res: Response) {
    const itemId = Number(req.params.item_id);
    if (Number.isNaN(itemId))
      return res.status(400).json({ success: false, error: { message: 'Invalid item_id' } });
    const result = await MenuItemModifierSectionService.findAllByItem(itemId);
    return res.status(result.payload.status).json(result);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ success: false, error: { message: 'Invalid id' } });
    const result = await MenuItemModifierSectionService.findById(id);
    return res.status(result.payload.status).json(result);
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body as MenuItemModifierSectionPayload;
      validateCreateMenuItemModifierSection(payload);
      const result = await MenuItemModifierSectionService.create(payload);
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
      const payload = req.body as Partial<MenuItemModifierSectionPayload>;
      validateUpdateMenuItemModifierSection(payload);
      const result = await MenuItemModifierSectionService.update(id, payload);
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
    const result = await MenuItemModifierSectionService.delete(id);
    return res.status(result.payload.status).json(result);
  },
};