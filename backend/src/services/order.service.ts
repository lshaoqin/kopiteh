import type { OrderPayload, UpdateOrderPayload } from '../types/payloads';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';
import { OrderStatusCodes, OrderItemStatusCodes } from '../types/orderStatus';
import { OrderItemService } from './orderItem.service';
import pool from '../config/database';

const ITEM_COLUMNS = new Set([
  'table_id',
  'user_id',
  'status',
  'total_price',
  'created_at',
]);


export const OrderService = {
  async findByUser(user_id: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        'SELECT * FROM "order" WHERE user_id = $1 ORDER BY order_id',
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

async create(request: OrderPayload): Promise<ServiceResult<any>> {
  try {
    const tableRes = await BaseService.query(
      'SELECT table_id FROM "table" WHERE table_number = $1 LIMIT 1',
      [String(request.table_number)]
    );

    if (tableRes.rows.length === 0) {
      throw new Error(`Table ${request.table_number} does not exist`);
    }
    const tableId = tableRes.rows[0].table_id;
    
    // 2. Create Order Header
    const userId = (request as any).user_id || 1; 
    const orderRes = await BaseService.query(
      `INSERT INTO "order" (table_id, user_id, status, total_price, created_at) 
        VALUES ($1, $2, $3, $4, NOW()) 
        RETURNING order_id`,
      [tableId, userId, 'pending', request.total_price]
    );
    const orderId = orderRes.rows[0].order_id;

    // 3. Loop through items and call the Sub-Service
    for (const item of request.items) {
      const itemPayload = {
        ...item,
        order_id: orderId,
        status: OrderItemStatusCodes.INCOMING
      };

      const itemResult = await OrderItemService.create(itemPayload, 'STANDARD');
      
      // If an item fails, throw error to trigger the automatic ROLLBACK in BaseService.tx
      if (!itemResult.success) {
        throw new Error(itemResult.payload.message);
      }
    }

    // Return the final success response. BaseService.tx will handle the COMMIT.
    return successResponse(SuccessCodes.CREATED, { order_id: orderId });
  } catch (error: any) {
    // BaseService.tx has already handled the ROLLBACK and release() by this point
    return errorResponse(ErrorCodes.DATABASE_ERROR, error.message || String(error));
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
          COALESCE(
            SUM(
              (oi.price + COALESCE(mod_sum.modifier_total, 0)) * oi.quantity
            ), 
            0
          ) as total_amount
        FROM stall s
        LEFT JOIN menu_item mi ON s.stall_id = mi.stall_id
        LEFT JOIN order_item oi ON mi.item_id = oi.item_id
        LEFT JOIN (
          SELECT order_item_id, SUM(price_modifier) as modifier_total
          FROM order_item_modifiers
          GROUP BY order_item_id
        ) mod_sum ON oi.order_item_id = mod_sum.order_item_id
        LEFT JOIN "order" o ON oi.order_id = o.order_id
        WHERE (o.order_id IS NULL OR (
          o.created_at >= $1 
          AND o.created_at < $2
          AND o.status != 'CANCELLED'
        ))
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

  async getAllWithFilters(filters: {
    startDate?: string;
    endDate?: string;
    tableNumber?: string;
    venueId?: number;
    stallId?: number;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<any>> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 15;
      const offset = (page - 1) * limit;

      let countQuery = `
        SELECT COUNT(DISTINCT o.order_id)::int as total
        FROM "order" o
        LEFT JOIN "table" t ON o.table_id = t.table_id
        LEFT JOIN venue v ON t.venue_id = v.venue_id
      `;

      let query = `
        SELECT DISTINCT
          o.order_id,
          o.table_id,
          o.user_id,
          o.status,
          o.total_price,
          o.created_at,
          t.table_number,
          t.venue_id,
          v.name as venue_name
        FROM "order" o
        LEFT JOIN "table" t ON o.table_id = t.table_id
        LEFT JOIN venue v ON t.venue_id = v.venue_id
      `;

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      // Add filters
      if (filters.startDate) {
        conditions.push(`o.created_at >= $${paramIndex++}`);
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        conditions.push(`o.created_at <= $${paramIndex++}`);
        params.push(filters.endDate);
      }

      if (filters.tableNumber) {
        conditions.push(`t.table_number = $${paramIndex++}`);
        params.push(filters.tableNumber);
      }

      if (filters.venueId) {
        conditions.push(`t.venue_id = $${paramIndex++}`);
        params.push(filters.venueId);
      }

      if (filters.stallId) {
        query += `
          LEFT JOIN order_item oi ON o.order_id = oi.order_id
          LEFT JOIN menu_item mi ON oi.item_id = mi.item_id
        `;
        countQuery += `
          LEFT JOIN order_item oi ON o.order_id = oi.order_id
          LEFT JOIN menu_item mi ON oi.item_id = mi.item_id
        `;
        conditions.push(`mi.stall_id = $${paramIndex++}`);
        params.push(filters.stallId);
      }

      if (conditions.length > 0) {
        const whereClause = ` WHERE ${conditions.join(' AND ')}`;
        query += whereClause;
        countQuery += whereClause;
      }

      // Get total count
      const countResult = await BaseService.query(countQuery, params);
      const total = countResult.rows[0].total;

      // Add ordering and pagination
      query += ` ORDER BY o.created_at ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limit, offset);

      const result = await BaseService.query(query, params);
      
      return successResponse(SuccessCodes.OK, {
        orders: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};