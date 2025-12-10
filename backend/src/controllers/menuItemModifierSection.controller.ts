import type { Request, Response } from 'express';
import type { MenuItemModifierSectionPayload } from '../types/payloads';
import { MenuItemModifierSectionService } from '../services/menuItemModifierSection.service';
import { BadRequestError } from './errors';
import { errorResponse, successResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';

export const MenuItemModifierSectionController = {
  async getAll(req: Request, res: Response) {
    const itemId = Number(req.params.item_id);
    const data = await MenuItemModifierSectionService.findAllByItem(itemId);
    const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = await MenuItemModifierSectionService.findById(id);
    const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body as MenuItemModifierSectionPayload;
      const data = await MenuItemModifierSectionService.create(payload);
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
      const payload = req.body as Partial<MenuItemModifierSectionPayload>;
      const data = await MenuItemModifierSectionService.update(id, payload);
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
    const data = await MenuItemModifierSectionService.delete(id);
    const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },
};