import type { Request, Response } from "express";
import type { TablePayload } from "../types/payloads";
import { TableService } from "../services/table.service";
import { BadRequestError } from "./errors";
import { errorResponse, successResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";
import { SuccessCodes } from "../types/success";

export const TableController = {
  async getAll(req: Request, res: Response) {
    const venue_id = Number(req.params.venue_id);
    const result = await TableService.findAllByVenue(venue_id);
    return res.status(result.payload.status).json(result);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await TableService.findById(id);
    return res.status(result.payload.status).json(result);
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body as TablePayload;
      const result = await TableService.create(payload);
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

  async createBulk(req: Request, res: Response) {
    try {
      const { venue_id, start_num, end_num } = req.body;
      
      if (!venue_id || start_num === undefined || end_num === undefined) {
        const result = errorResponse(ErrorCodes.VALIDATION_ERROR, "venue_id, start_num, and end_num are required");
        return res.status(result.payload.status).json(result);
      }

      if (start_num > end_num) {
        const result = errorResponse(ErrorCodes.VALIDATION_ERROR, "start_num must be less than or equal to end_num");
        return res.status(result.payload.status).json(result);
      }

      if (end_num - start_num > 100) {
        const result = errorResponse(ErrorCodes.VALIDATION_ERROR, "Cannot create more than 100 tables at once");
        return res.status(result.payload.status).json(result);
      }

      const serviceResult = await TableService.createBulk(venue_id, start_num, end_num);
      return res.status(serviceResult.payload.status).json(serviceResult);
    } catch (err) {
      const result = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(result.payload.status).json(result);
    }
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await TableService.delete(id);
    return res.status(result.payload.status).json(result);
  },

  async removeBulk(req: Request, res: Response) {
    try {
      const { venue_id, table_numbers } = req.body;
      
      if (!venue_id || !Array.isArray(table_numbers) || table_numbers.length === 0) {
        const result = errorResponse(ErrorCodes.VALIDATION_ERROR, "venue_id and table_numbers array are required");
        return res.status(result.payload.status).json(result);
      }

      const serviceResult = await TableService.deleteBulk(venue_id, table_numbers);
      return res.status(serviceResult.payload.status).json(serviceResult);
    } catch (err) {
      const result = errorResponse(ErrorCodes.INTERNAL_ERROR);
      return res.status(result.payload.status).json(result);
    }
  },
};
