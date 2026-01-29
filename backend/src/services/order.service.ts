import type { OrderPayload, UpdateOrderPayload } from '../types/payloads';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';
import { OrderStatusCodes, OrderItemStatusCodes } from '../types/orderStatus';
import { OrderItemService } from './orderItem.service';
import { PoolClient } from 'pg';
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
        'SELECT * AS type FROM "order" WHERE user_id = $1 ORDER BY order_id',
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
        `SELECT * AS type FROM "order" WHERE order_id IN (
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
        'SELECT * AS type FROM "order" WHERE table_id = $1 ORDER BY order_id',
        [table_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query('SELECT * AS type FROM "order" WHERE order_id = $1', [id]);
      if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Order not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: OrderPayload, client?: PoolClient): Promise<ServiceResult<any>> {
    const queryRunner = client || pool; 

    try {
      await queryRunner.query('BEGIN'); // Start Transaction

      // 1. Get Table ID
      const tableRes = await queryRunner.query(
        'SELECT table_id FROM "table" WHERE table_number = $1 LIMIT 1',
        [String(payload.table_number)]
      );

      if (tableRes.rows.length === 0) {
        throw new Error(`Table ${payload.table_number} does not exist`);
      }
      const tableId = tableRes.rows[0].table_id;
      
      // 2. Create Order Header
      const userId = (payload as any).user_id || 1; 
      const orderRes = await queryRunner.query(
        `INSERT INTO "order" (table_id, user_id, status, total_price, created_at, remarks) 
         VALUES ($1, $2, $3, $4, NOW(), $5) 
         RETURNING order_id`,
        [tableId, userId, 'pending', payload.total_price, payload.remarks || null]
      );
      const orderId = orderRes.rows[0].order_id;

      // 3. Loop through items and call the Sub-Service
      for (const item of payload.items) {
        
        // Prepare the payload for the item service
        const itemPayload = {
          ...item,
          order_id: orderId, // Inject the new Order ID
          status: OrderItemStatusCodes.INCOMING
        };

        // CALL THE SERVICE, PASSING THE CLIENT
        // This ensures the item is created inside this 'BEGIN' transaction
        await OrderItemService.create(itemPayload, queryRunner);
      }

      await queryRunner.query('COMMIT'); // Save everything
      return successResponse(SuccessCodes.CREATED, { order_id: orderId });

    } catch (error: any) {
      await queryRunner.query('ROLLBACK'); // Undo everything if any item fails
      console.error("Order Create Error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, error.message || String(error));
    } finally {
      if (!client) {
        queryRunner.release();
      }
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
      return successResponse<any>(SuccessCodes.OK, result.rows[0]);
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

  async getMonthlyAnalytics(year: number, month: number): Promise<ServiceResult<any>> {
    try {
      // Get the start and end dates for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      // Get total orders and total amount for the month
      const totalResult = await BaseService.query(
        `SELECT 
          COUNT(*)::int as total_orders,
          COALESCE(SUM(total_price), 0) as total_amount
        FROM "order"
        WHERE created_at >= $1 AND created_at < $2
          AND status != 'CANCELLED'`,
        [startDate.toISOString(), endDate.toISOString()]
      );

      // Get analytics per stall
      const stallResult = await BaseService.query(
        `SELECT 
          s.stall_id,
          s.name as stall_name,
          COUNT(DISTINCT o.order_id)::int as total_orders,
          COALESCE(SUM(oi.price * oi.quantity), 0) as total_amount
        FROM stall s
        LEFT JOIN menu_item mi ON s.stall_id = mi.stall_id
        LEFT JOIN order_item oi ON mi.item_id = oi.item_id
        LEFT JOIN "order" o ON oi.order_id = o.order_id
          AND o.created_at >= $1 
          AND o.created_at < $2
          AND o.status != 'CANCELLED'
        GROUP BY s.stall_id, s.name
        ORDER BY s.name`,
        [startDate.toISOString(), endDate.toISOString()]
      );

      return successResponse(SuccessCodes.OK, {
        total_orders: totalResult.rows[0].total_orders,
        total_amount: totalResult.rows[0].total_amount,
        stalls: stallResult.rows,
      });
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};