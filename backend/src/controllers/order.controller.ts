import type { Request, Response } from 'express';
import type { OrderPayload, UpdateOrderPayload } from '../types/payloads';
import { OrderService } from '../services/order.service';
import { OrderItemService } from '../services/orderItem.service';
import { BadRequestError } from './errors';
import { errorResponse, successResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from 'src/types/success';
import { validateCreateOrder, validateUpdateOrder } from '../validations/order.validation';

export const OrderController = {
  async getByUser(req: Request, res: Response) {
    const userId = Number(req.params.user_id);
    const data = await OrderService.findByUser(userId);
    const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async getByStall(req: Request, res: Response) {
    const orderId = Number(req.params.order_id);
    const data = await OrderService.findByStall(orderId);
    const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = await OrderService.findById(id);
    const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body as OrderPayload;
      validateCreateOrder(payload);
      const data = await OrderService.create(payload);
      const result = successResponse(SuccessCodes.OK, data);
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
      const payload = req.body as UpdateOrderPayload;
      validateUpdateOrder(payload);
      const data = await OrderService.update(id, payload);
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

  async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data = await OrderService.updateStatus(id);
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

  async cancel(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const orderItems = await OrderItemService.findByOrder(id);
      if (orderItems.success === false || orderItems.payload.data === null) {
        const result = errorResponse(ErrorCodes.DATABASE_ERROR, 'No order items retrieved');
        return res.status(result.payload.status).json(result);
      }
      for (const item of orderItems.payload.data) {
        await OrderItemService.cancel(item.order_item_id);
      }
      const result = successResponse(SuccessCodes.OK);
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
    const data = await OrderService.delete(id);
    const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },
};