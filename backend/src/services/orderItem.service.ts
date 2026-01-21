import type { OrderItemPayload, UpdateOrderItemPayload } from '../types/payloads';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';
import { OrderItemStatusCodes, NextOrderItemStatusMap } from '../types/orderStatus';
import {MenuItemService} from "./menuItem.service";
import { OrderService } from './order.service';

const ITEM_COLUMNS = new Set([
  'order_id',
  'item_id',
  'quantity',
  'unit_price',
  'line_subtotal',
]);

export const OrderItemService = {
  async findByOrder(order_id: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        'SELECT * FROM Order_Item WHERE order_id = $1 ORDER BY order_item_id',
        [order_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findByStall(stall_id: number): Promise<ServiceResult<any[]>> {
    try {
      const stallItems = await MenuItemService.findAllByStall(stall_id);
      if (!stallItems.success) {
        return errorResponse(ErrorCodes.DATABASE_ERROR, stallItems.payload.message);
      } else if (stallItems.payload.data === null) {
        return successResponse(SuccessCodes.OK, []); 
      }
      const result = [];
      for (const item of stallItems.payload.data) {
        const orderItems = await BaseService.query(
          'SELECT * FROM Order_Item WHERE item_id = $1 ORDER BY order_item_id',
          [item.item_id]
        );
        result.push(...orderItems.rows);
      }
      return successResponse(SuccessCodes.OK, result);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        'SELECT * Order_Item WHERE order_item_id = $1', 
        [id]
      );
      if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: OrderItemPayload): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        'INSERT INTO Order_Item (order_id, item_id, quantity, unit_price, line_subtotal) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [
          payload.order_id,
          payload.item_id,
          payload.quantity,
          payload.unit_price,
          payload.line_subtotal,
        ]
      );
      return successResponse(SuccessCodes.CREATED, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async update(id: number, payload: UpdateOrderItemPayload): Promise<ServiceResult<any>> {
    const entries = Object.entries(payload).filter(([key]) => ITEM_COLUMNS.has(key));
    if (entries.length === 0)
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'No valid fields to update');

    const setClause = entries.map(([field], i) => `${field} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v ?? null);

    try {
      const query = `UPDATE Order_Item SET ${setClause} WHERE order_item_id = $${
        entries.length + 1
      } RETURNING *`;
      const result = await BaseService.query(query, [...values, id]);
      if (!result.rows[0])
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async updateStatus(id: number): Promise<ServiceResult<any>> {
    // Get status and order_id of the OrderItem
    const orderItemInfo = await BaseService.query(
      'SELECT status, order_id FROM Order_Item WHERE order_item_id = $1', [id]
    );
    if (!orderItemInfo.rows[0])
      return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
    const currStatus = orderItemInfo.rows[0].status;
    const orderId = orderItemInfo.rows[0].order_id;

    // Determine next status
    const nextStatus = NextOrderItemStatusMap[currStatus.rows[0].status as OrderItemStatusCodes];
    if (!nextStatus)
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Order Item is already in final status');

    try {
      const result = await BaseService.query(
        'UPDATE Order_Item SET status = $1 WHERE order_item_id = $2 RETURNING *',
        [nextStatus, id]
      );
      OrderService.updateStatus(orderId); // Try to update order status as well
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async cancel(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query(
        'UPDATE Order_Item SET status = $1 WHERE order_item_id = $2 RETURNING *', 
        [OrderItemStatusCodes.CANCELLED, id]
      );
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
      OrderService.updateStatus(id); // Try to update order status as well
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query(
        'DELETE FROM Order_Item WHERE order_item_id = $1', 
        [id]
      );
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};