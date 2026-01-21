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
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Look up Table ID using Table Number
      const tableRes = await client.query(
        'SELECT table_id FROM "table" WHERE table_number = $1 LIMIT 1',
        [String(payload.table_number)]
      );

      if (tableRes.rows.length === 0) {
        throw new Error(`Table ${payload.table_number} does not exist`);
      }
      const tableId = tableRes.rows[0].table_id;
      
      // 2. Insert Order
      // Use ID 1 (Guest) if user_id is missing/not provided
      const userId = (payload as any).user_id || 1; 

      const orderRes = await client.query(
        `INSERT INTO "order" (table_id, user_id, status, total_price, created_at) 
         VALUES ($1, $2, $3, $4, NOW()) 
         RETURNING order_id`,
        [tableId, userId, 'pending', payload.total_price]
      );
      const orderId = orderRes.rows[0].order_id;

      // 3. Insert Items & Modifiers
      for (const item of payload.items) {
        const itemRes = await client.query(
          `INSERT INTO order_item (order_id, item_id, quantity, price, status)
           VALUES ($1, $2, $3, $4, 'INCOMING')
           RETURNING order_item_id`,
          [orderId, item.item_id, item.quantity, item.price]
        );
        const orderItemId = itemRes.rows[0].order_item_id;

        if (item.modifiers && item.modifiers.length > 0) {
          for (const mod of item.modifiers) {
            await client.query(
              `INSERT INTO order_item_modifiers (order_item_id, option_id, price_modifier, option_name)
               VALUES ($1, $2, $3, $4)`,
              [orderItemId, mod.option_id, mod.price, mod.name]
            );
          }
        }
      }

      await client.query('COMMIT');
      return successResponse(SuccessCodes.CREATED, { order_id: orderId });

    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error("Order Create Error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, error.message || String(error));
    } finally {
      client.release();
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
            'UPDATE Order SET status = $1 WHERE order_id = $2 RETURNING *', 
            [OrderStatusCodes.CANCELLED, id]
          )
        } else {
          result = await BaseService.query(
            'UPDATE Order SET status = $1 WHERE order_id = $2 RETURNING *', 
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
      const result = await BaseService.query('DELETE FROM Order WHERE order_id = $1', [id]);
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order not found');
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};