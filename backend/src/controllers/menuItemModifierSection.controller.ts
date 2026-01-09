import type { Request, Response } from "express";
import type { MenuItemModifierSectionPayload } from "../types/payloads";
import { MenuItemModifierSectionService } from "../services/menuItemModifierSection.service";
import { BadRequestError } from "./errors";
import { errorResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";

export const MenuItemModifierSectionController = {
  // GET /item-sections/items/:item_id
  async getAll(req: Request, res: Response) {
    const itemId = Number(req.params.item_id);
    const result = await MenuItemModifierSectionService.findAllByItem(itemId);
    return res.status(result.payload.status).json(result);
  },

  // GET /item-sections/:id
  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await MenuItemModifierSectionService.findById(id);
    return res.status(result.payload.status).json(result);
  },

  // POST /item-sections/create
  async create(req: Request, res: Response) {
    try {
      const payload = req.body as MenuItemModifierSectionPayload;
      const result = await MenuItemModifierSectionService.create(payload);
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

  // PUT /item-sections/update/:id
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const payload = req.body as Partial<MenuItemModifierSectionPayload>;
      const result = await MenuItemModifierSectionService.update(id, payload);
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

  // DELETE /item-sections/remove/:id
  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await MenuItemModifierSectionService.delete(id);
    return res.status(result.payload.status).json(result);
  },
};
