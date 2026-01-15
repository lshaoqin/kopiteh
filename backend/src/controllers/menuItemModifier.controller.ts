import type { Request, Response } from "express";
import type { MenuItemModifierPayload } from "../types/payloads";
import { MenuItemModifierService } from "../services/menuItemModifier.service";
import { BadRequestError } from "./errors";
import { errorResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";

export const MenuItemModifierController = {
  // GET /modifiers/items/:item_id
  async getAllByItem(req: Request, res: Response) {
    const itemId = Number(req.params.item_id);
    const result = await MenuItemModifierService.findAllByItem(itemId);
    return res.status(result.payload.status).json(result);
  },

  // GET /modifiers/sections/:section_id
  async getAllBySection(req: Request, res: Response) {
    const sectionId = Number(req.params.section_id);
    const result = await MenuItemModifierService.findAllBySection(sectionId);
    return res.status(result.payload.status).json(result);
  },

  // GET /modifiers/:id
  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await MenuItemModifierService.findById(id);
    return res.status(result.payload.status).json(result);
  },

  // POST /modifiers/create
  async create(req: Request, res: Response) {
    try {
      const payload = req.body as MenuItemModifierPayload;
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

  // PUT /modifiers/update/:id
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const payload = req.body as Partial<MenuItemModifierPayload>;
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

  // DELETE /modifiers/remove/:id
  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await MenuItemModifierService.delete(id);
    return res.status(result.payload.status).json(result);
  },
};
