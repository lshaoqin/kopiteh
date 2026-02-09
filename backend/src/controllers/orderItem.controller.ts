import type { Request, Response } from 'express';
import type { OrderItemPayload, UpdateOrderItemPayload } from '../types/payloads';
import { OrderItemService } from '../services/orderItem.service';
import { MenuItemService } from '../services/menuItem.service';
import { WebSocketService } from '../services/websocket.service';
import { BadRequestError } from './errors';
import { errorResponse, successResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';

export const OrderItemController = {
  async getByOrder(req: Request, res: Response) {
    const orderId = Number(req.params.order_id);
    const result = await OrderItemService.findByOrder(orderId);
    //const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async getByStall(req: Request, res: Response) {
    const stallId = Number(req.params.stall_id);
    const result = await OrderItemService.findByStall(stallId);
    //const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const type = req.params.type as 'STANDARD' | 'CUSTOM';
    const result = await OrderItemService.findById(id, type);
    //const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body as OrderItemPayload;
      const type = req.params.type as 'STANDARD' | 'CUSTOM';
      const result = await OrderItemService.create(payload, type);
      
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
      const payload = req.body as UpdateOrderItemPayload;
      const type = req.params.type as 'STANDARD' | 'CUSTOM';
      const result = await OrderItemService.update(id, payload, type);
      
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
      const type = req.params.type as 'STANDARD' | 'CUSTOM';
      const result = await OrderItemService.updateStatus(id, type);
      
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

  async revertStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const type = req.params.type as 'STANDARD' | 'CUSTOM';
      const result = await OrderItemService.revertStatus(id, type);
      
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
    const type = req.params.type as 'STANDARD' | 'CUSTOM';
    const result = await OrderItemService.cancel(id, type);
    //const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const type = req.params.type as 'STANDARD' | 'CUSTOM';
    const result = await OrderItemService.delete(id, type);
    //const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async getModifiers(req: Request, res: Response) {
    const orderItemId = Number(req.params.order_item_id);
    const result = await OrderItemService.findModifiersByOrderItem(orderItemId);
    return res.status(result.payload.status).json(result);
  },
};