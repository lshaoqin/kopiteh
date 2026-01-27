import type { CustomOrderItemPayload, UpdateCustomOrderItemPayload } from '../types/payloads';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';
import { OrderItemStatusCodes, NextOrderItemStatusMap } from '../types/orderStatus';

const ITEM_COLUMNS = new Set([
  'stall_id',
  'table_id',
  'user_id',
  'order_item_name',
  'status',
  'quantity',
  'price',
  'remarks',
]);

export const CustomOrderItemService = {
  async findByStall(stall_id: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        'SELECT * FROM custom_order_item WHERE stall_id = $1 ORDER BY custom_order_item_id',
        [stall_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findByUser(user_id: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        'SELECT * FROM custom_order_item WHERE user_id = $1 ORDER BY custom_order_item_id',
        [user_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        'SELECT * FROM custom_order_item WHERE custom_order_item_id = $1', 
        [id]
      );
      if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Custom Order Item not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: CustomOrderItemPayload): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        `INSERT INTO custom_order_item (stall_id, table_id, user_id, order_item_name, status, quantity, price, created_at, remarks) 
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [
          payload.stall_id,
          payload.table_id,
          payload.user_id ?? null,
          payload.order_item_name,
          payload.status,
          payload.quantity,
          payload.price,
          payload.created_at,
          payload.remarks ?? null,
        ]
      );
      return successResponse(SuccessCodes.CREATED, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async update(id: number, payload: UpdateCustomOrderItemPayload): Promise<ServiceResult<any>> {
    const entries = Object.entries(payload).filter(([key]) => ITEM_COLUMNS.has(key));
    if (entries.length === 0)
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'No valid fields to update');

    const setClause = entries.map(([field], i) => `${field} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v ?? null);

    try {
      const query = `UPDATE custom_order_item SET ${setClause} WHERE custom_order_item_id = $${
        entries.length + 1
      } RETURNING *`;
      const result = await BaseService.query(query, [...values, id]);
      if (!result.rows[0])
        return errorResponse(ErrorCodes.NOT_FOUND, 'Custom Order Item not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async updateStatus(id: number): Promise<ServiceResult<any>> {
    // Get status and order_id of the OrderItem
    const orderItemInfo = await BaseService.query(
      'SELECT status, custom_order_id FROM custom_order_item WHERE custom_order_item_id = $1', [id]
    );
    if (!orderItemInfo.rows[0])
      return errorResponse(ErrorCodes.NOT_FOUND, 'Custom Order Item not found');
    const currStatus = orderItemInfo.rows[0].status;
    const orderId = orderItemInfo.rows[0].custom_order_id;

    // Determine next status
    const nextStatus = NextOrderItemStatusMap[currStatus as OrderItemStatusCodes];
    if (!nextStatus)
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Order Item is already in final status');

    try {
      const result = await BaseService.query(
        'UPDATE custom_order_item SET status = $1 WHERE custom_order_item_id = $2 RETURNING *',
        [nextStatus, id]
      );
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async cancel(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query(
        'UPDATE custom_order_item SET status = $1 WHERE custom_order_item_id = $2 RETURNING *', 
        [OrderItemStatusCodes.CANCELLED, id]
      );
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, 'Custom Order Item not found');
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query(
        'DELETE FROM custom_order_item WHERE custom_order_item_id = $1', 
        [id]
      );
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, 'Custom Order Item not found');
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};