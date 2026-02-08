import type { Request, Response } from 'express';
import type { OrderPayload, UpdateOrderPayload } from '../types/payloads';
import { OrderService } from '../services/order.service';
import { OrderItemService } from '../services/orderItem.service';
import { WebSocketService } from '../services/websocket.service';
import { BadRequestError } from './errors';
import { errorResponse, successResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';

export const OrderController = {
  async getByUser(req: Request, res: Response) {
    const userId = Number(req.params.user_id);
    const result = await OrderService.findByUser(userId);
    //const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async getByStall(req: Request, res: Response) {
    const orderId = Number(req.params.order_id);
    const result = await OrderService.findByStall(orderId);
    //const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await OrderService.findById(id);
    //const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async create(req: Request, res: Response) {
    try {
      const payload = req.body as OrderPayload;
      const result = await OrderService.create(payload);
      //const result = successResponse(SuccessCodes.OK, data);
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
      const payload = req.body;
      
      const result = await OrderService.update(id, payload);
      
      // Emit WebSocket event if status changed
      if (result.success && payload.status && result.payload.data) {
        const order = result.payload.data;
        //WebSocketService.notifyOrderStatusChange(order.user_id, id, payload.status);
      }
      
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        const result = errorResponse(ErrorCodes.VALIDATION_ERROR, String(err.details));
        return res.status(result.payload.status).json(result);
      }
      throw err;
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);      
      const result = await OrderService.updateStatus(id);
      
      // Emit WebSocket event after successful update
      if (result.success && result.payload.data) {
        const order = result.payload.data;
        //WebSocketService.notifyOrderStatusChange(order.user_id, id, order.status);
      }
      
      return res.status(result.payload.status).json(result);
    } catch (err) {
      if (err instanceof BadRequestError) {
        const result = errorResponse(ErrorCodes.VALIDATION_ERROR, String(err.details));
        return res.status(result.payload.status).json(result);
      }
      throw err;
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
        await OrderItemService.cancel(item.order_item_id, 'STANDARD'); // Cancels order after all items are cancelled
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
    const result = await OrderService.delete(id);
    //const result = successResponse(SuccessCodes.OK, data);
    return res.status(result.payload.status).json(result);
  },

  async getMonthlyAnalytics(req: Request, res: Response) {
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    const venueId = req.query.venueId ? Number(req.query.venueId) : undefined;

    if (!year || !month || month < 1 || month > 12) {
      const result = errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid year or month');
      return res.status(result.payload.status).json(result);
    }

    const result = await OrderService.getMonthlyAnalytics(year, month, venueId);
    return res.status(result.payload.status).json(result);
  },

  async getAllWithFilters(req: Request, res: Response) {
    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      tableNumber: req.query.tableNumber as string | undefined,
      venueId: req.query.venueId ? Number(req.query.venueId) : undefined,
      stallId: req.query.stallId ? Number(req.query.stallId) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 15,
    };

    const result = await OrderService.getAllWithFilters(filters);
    return res.status(result.payload.status).json(result);
  },
};