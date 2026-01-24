import type { Request, Response } from 'express';
import type { CustomOrderItemPayload, UpdateCustomOrderItemPayload } from '../types/payloads';
import { CustomOrderItemService } from '../services/customOrderItem.service';
import { WebSocketService } from '../services/websocket.service';
import { BadRequestError } from './errors';
import { errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';

export const CustomOrderItemController = {
  async getByStall(req: Request, res: Response) {
    const stallId = Number(req.params.stall_id);
    const result = await CustomOrderItemService.findByStall(stallId);
    return res.status(result.payload.status).json(result);
  },

  async getByUser(req: Request, res: Response) {
    const userId = Number(req.params.user_id);
    const result = await CustomOrderItemService.findByUser(userId);
    return res.status(result.payload.status).json(result);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await CustomOrderItemService.findById(id);
    return res.status(result.payload.status).json(result);
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body as CustomOrderItemPayload;
      const result = await CustomOrderItemService.create(payload);
      
      // Emit WebSocket event to the stall room if custom order item created successfully
      if (result.success && result.payload.data) {
        const customOrderItem = result.payload.data;
        WebSocketService.notifyStallOrderItemCreated(customOrderItem.stall_id, customOrderItem);
      }
      
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        if (err instanceof BadRequestError) {
          const result = errorResponse(ErrorCodes.VALIDATION_ERROR, String(err.details));
          return res.status(result.payload.status).json(result);
        }
        const result = errorResponse(ErrorCodes.INTERNAL_ERROR);
        return res.status(result.payload.status).json(result);
      }
    }
  },
        
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const payload = req.body as UpdateCustomOrderItemPayload;
      const result = await CustomOrderItemService.update(id, payload);
      
      // Emit WebSocket event to the stall room if custom order item updated successfully
      if (result.success && result.payload.data) {
        const customOrderItem = result.payload.data;
        WebSocketService.notifyStallOrderItemUpdated(customOrderItem.stall_id, customOrderItem);
      }
      
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

  async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const result = await CustomOrderItemService.updateStatus(id);
      
      // Emit WebSocket event to the stall room if status updated successfully
      if (result.success && result.payload.data) {
        const customOrderItem = result.payload.data;
        WebSocketService.notifyStallOrderItemUpdated(customOrderItem.stall_id, customOrderItem);
      }
      
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

  async cancel(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await CustomOrderItemService.cancel(id);
    return res.status(result.payload.status).json(result);
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await CustomOrderItemService.delete(id);
    return res.status(result.payload.status).json(result);
  },
};