import type { OrderPayload, UpdateOrderPayload } from '../types/payloads';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';
import { OrderStatusCodes, OrderItemStatusCodes } from '../types/orderStatus';
import pool from '../config/database'; 

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
        `SELECT * FROM "order" WHERE order_id IN (
          SELECT order_id FROM order_item WHERE item_id IN (
            SELECT item_id FROM menu_item WHERE stall_id = $1
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
        'SELECT * FROM "order" WHERE table_id = $1 ORDER BY order_id',
        [table_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query('SELECT * FROM "order" WHERE order_id = $1', [id]);
      if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Order not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: OrderPayload): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        'INSERT INTO "order" (table_id, user_id, status, total_price, created_at, remarks) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *, \'STANDARD\' AS type',
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
      const query = `UPDATE "order" SET ${setClause} WHERE order_id = $${ 
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
    try {
      // get the list of order items for the order
      const orderItemStatus = await BaseService.query(
        'SELECT status FROM Order_Item WHERE order_id = $1',
        [id]
      );
      // check if order_items are all served or cancelled
      const allCompleted = orderItemStatus.rows.every(
        (item: any) => item.status === OrderItemStatusCodes.SERVED || item.status === OrderItemStatusCodes.CANCELLED);
      const allCancelled = orderItemStatus.rows.every(
        (item: any) => item.status === OrderItemStatusCodes.CANCELLED);
      let result;
      if (allCompleted) {
        if (allCancelled) {
          result = await BaseService.query(
            'UPDATE "order" SET status = $1 WHERE order_id = $2 RETURNING *', 
            [OrderStatusCodes.CANCELLED, id]
          )
        } else {
          result = await BaseService.query(
            'UPDATE "order" SET status = $1 WHERE order_id = $2 RETURNING *', 
            [OrderStatusCodes.COMPLETED, id]
          )
        }
      } else {
        return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Not all order items are completed');
      }
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order not found');
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query('DELETE FROM "order" WHERE order_id = $1', [id]);
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order not found');
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};