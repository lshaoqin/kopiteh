import type { Request, Response } from "express";
import type { MenuItemPayload, UpdateMenuItemPayload } from "../types/payloads";
import { MenuItemService } from "../services/menuItem.service";
import { BadRequestError } from "./errors";
import { errorResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";

export const MenuItemController = {
  // GET /items/stalls/:stall_id
  async getAll(req: Request, res: Response) {
    const stallId = Number(req.params.stall_id);
    const categoryIdRaw = req.query.category_id as string | undefined;
    const categoryId = categoryIdRaw ? Number(categoryIdRaw) : undefined;

    const result = await MenuItemService.findAllByStall(stallId, categoryId);
    return res.status(result.payload.status).json(result);
  },

  // GET /items/:id
  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await MenuItemService.findById(id);
    return res.status(result.payload.status).json(result);
  },

  // POST /items/create
  async create(req: Request, res: Response) {
    try {
      const payload = req.body as MenuItemPayload;
      const result = await MenuItemService.create(payload);
      return res.status(result.payload.status).json(result);
    } catch (err) {
      // validation middleware throws BadRequestError, but keep this for safety
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

  // PUT /items/update/:id
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const payload = req.body as UpdateMenuItemPayload;
      const result = await MenuItemService.update(id, payload);
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

  // DELETE /items/remove/:id
  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await MenuItemService.delete(id);
    return res.status(result.payload.status).json(result);
  },
};
