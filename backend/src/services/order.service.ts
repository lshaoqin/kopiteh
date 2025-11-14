import type { OrderPayload, UpdateOrderPayload } from '../types/payloads';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';
import { OrderStatusCodes, NextOrderStatusMap } from '../types/orderStatus';

const ITEM_COLUMNS = new Set([
  'table_id',
  'user_id',
  'status',
  'total_price',
  'created_at',
  'remarks',
]);

export const OrderService = {
  async findByUser(user_id: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        'SELECT * FROM Order WHERE user_id = $1 ORDER BY order_id',
        [user_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findByStall(stall_id: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        `SELECT * FROM Order WHERE order_id IN (
          SELECT order_id FROM Order_Item WHERE item_id IN (
            SELECT item_id FROM Menu_Item WHERE stall_id = $1
          )
        ) ORDER BY order_id`,
        [stall_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  // Currently not used but kept for future reference
  async findByTable(table_id: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        'SELECT * FROM Order WHERE table_id = $1 ORDER BY order_id',
        [table_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query('SELECT * Order WHERE order_id = $1', [id]);
      if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Order not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: OrderPayload): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        'INSERT INTO Order (table_id, user_id, status, total_price, created_at, remarks) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [
          payload.table_id,
          payload.user_id,
          payload.status ?? null,
          payload.total_price ?? null,
          payload.created_at,
          payload.remarks ?? null,
        ]
      );
      return successResponse(SuccessCodes.CREATED, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async update(id: number, payload: UpdateOrderPayload): Promise<ServiceResult<any>> {
    const entries = Object.entries(payload).filter(([key]) => ITEM_COLUMNS.has(key));
    if (entries.length === 0)
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'No valid fields to update');

    const setClause = entries.map(([field], i) => `${field} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v ?? null);

    try {
      const query = `UPDATE Order SET ${setClause} WHERE order_id = $${
        entries.length + 1
      } RETURNING *`;
      const result = await BaseService.query(query, [...values, id]);
      if (!result.rows[0])
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async updateStatus(id: number): Promise<ServiceResult<any>> {
    const currentStatus = await BaseService.query(
      'SELECT status FROM Order WHERE order_id = $1', [id]
    );
    if (currentStatus.rowCount === 0)
      return errorResponse(ErrorCodes.NOT_FOUND, 'Order not found');
    const nextStatus = NextOrderStatusMap[currentStatus.rows[0].status as OrderStatusCodes];
    if (!nextStatus)
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Order is already served or cancelled');

    try {
      const result = await BaseService.query(
        'UPDATE Order SET status = $1 WHERE order_id = $2 RETURNING *',
        [nextStatus, id]
      );
      if (!result.rows[0])
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async cancel(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query(
        'UPDATE Order SET status = $1 WHERE order_id = $2 RETURNING *', 
        [OrderStatusCodes.CANCELLED, id]
      );
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order not found');
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query('DELETE FROM Order WHERE order_id = $1', [id]);
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order not found');
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};