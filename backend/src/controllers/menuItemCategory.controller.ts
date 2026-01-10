import type { Request, Response } from "express";
import type { MenuItemCategoryPayload, UpdateMenuItemCategoryPayload } from "../types/payloads";
import { MenuItemCategoryService } from "../services/menuItemCategory.service";
import { BadRequestError } from "./errors";
import { errorResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";

export const MenuItemCategoryController = {
  // GET /categories/stalls/:stall_id
  async getAll(req: Request, res: Response) {
    const stallId = Number(req.params.stall_id);
    const result = await MenuItemCategoryService.findAllByStall(stallId);
    return res.status(result.payload.status).json(result);
  },

  // GET /categories/:id
  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await MenuItemCategoryService.findById(id);
    return res.status(result.payload.status).json(result);
  },

  // POST /categories/create
  async create(req: Request, res: Response) {
    try {
      const payload = req.body as MenuItemCategoryPayload;
      const result = await MenuItemCategoryService.create(payload);
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

  // PUT /categories/update/:id
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const payload = req.body as UpdateMenuItemCategoryPayload;
      const result = await MenuItemCategoryService.update(id, payload);
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

  // DELETE /categories/remove/:id
  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await MenuItemCategoryService.delete(id);
    return res.status(result.payload.status).json(result);
  },
};
