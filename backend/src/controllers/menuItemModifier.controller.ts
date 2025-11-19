import type { Request, Response } from 'express';
import type { MenuItemModifierPayload } from '../types/payloads';
import { MenuItemModifierService } from '../services/menuItemModifier.service';
import { BadRequestError } from './errors';
import { errorResponse, successResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from 'src/types/success';
import {
  validateCreateMenuItemModifier,
  validateUpdateMenuItemModifier,
} from '../validations/menuItemModifier.validation';

export const MenuItemModifierController = {
  async getAll(req: Request, res: Response) {
    const itemId = Number(req.params.item_id);
    const data = await MenuItemModifierService.findAllByItem(itemId);
    const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = await MenuItemModifierService.findById(id);
    const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body as MenuItemModifierPayload;
      validateCreateMenuItemModifier(payload);
      const data = await MenuItemModifierService.create(payload);
      const result = successResponse(SuccessCodes.OK, data);
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
      const payload = req.body as Partial<MenuItemModifierPayload>;
      validateUpdateMenuItemModifier(payload);
      const data = await MenuItemModifierService.update(id, payload);
      const result = successResponse(SuccessCodes.OK, data);
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
    const data = await MenuItemModifierService.delete(id);
    const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },
};
