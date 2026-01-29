import type { FetchOrderItemPayload, OrderItemPayload, UpdateOrderItemPayload } from '../types/payloads';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';
import { OrderItemStatusCodes, NextOrderItemStatusMap } from '../types/orderStatus';
import {MenuItemService} from "./menuItem.service";
import { OrderService } from './order.service';
import { PoolClient } from 'pg';
import pool from '../config/database';
import { query } from 'express-validator';

const ITEM_COLUMNS = new Set([
  'order_id',
  'item_id',
  'quantity',
  'price',
]);

export const OrderItemService = {
  async findByOrder(order_id: number): Promise<ServiceResult<FetchOrderItemPayload[]>> {
    try {
      const result = await BaseService.query(
        `SELECT m.stall_id, t.table_id, o.user_id, m.name as order_item_name, 
        oi.status, oi.quantity, oi.price, o.created_at, o.remarks, \'STANDARD\' AS type
        FROM order_item oi 
        JOIN menu_item m ON oi.item_id = m.item_id 
        JOIN "order" o ON oi.order_id = o.order_id 
        JOIN "table" t ON o.table_id = t.table_id 
        WHERE oi.order_id = $1 ORDER BY oi.order_item_id`,
        [order_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findByStall(stall_id: number): Promise<ServiceResult<FetchOrderItemPayload[]>> {
    try {
      const stallItems = await MenuItemService.findAllByStall(stall_id);
      if (!stallItems.success) {
        return errorResponse(ErrorCodes.DATABASE_ERROR, stallItems.payload.message);
      } else if (stallItems.payload.data === null) {
        return successResponse(SuccessCodes.OK, []); 
      }
      const result = await BaseService.query(
        `SELECT m.stall_id, t.table_id, o.user_id, m.name as order_item_name, 
        oi.status, oi.quantity, oi.price, o.created_at, o.remarks, \'STANDARD\' AS type
        FROM order_item oi 
        JOIN menu_item m ON oi.item_id = m.item_id 
        JOIN "order" o ON oi.order_id = o.order_id 
        JOIN "table" t ON o.table_id = t.table_id 
        WHERE m.stall_id = $1 ORDER BY oi.order_item_id`,
        [stall_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<FetchOrderItemPayload>> {
    try {
      const result = await BaseService.query(
        `SELECT m.stall_id, t.table_id, o.user_id, m.name as order_item_name, 
        oi.status, oi.quantity, oi.price, o.created_at, o.remarks, \'STANDARD\' AS type
        FROM order_item oi 
        JOIN menu_item m ON oi.item_id = m.item_id 
        JOIN "order" o ON oi.order_id = o.order_id 
        JOIN "table" t ON o.table_id = t.table_id 
        WHERE oi.order_item_id = $1 ORDER BY oi.order_item_id`,
        [id]
      );
      if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: OrderItemPayload, client?: PoolClient): Promise<ServiceResult<any>> {
    // 1. Determine which "Query Runner" to use
    // If a transaction client is passed, use it. Otherwise, use the global pool.
    const queryRunner = client || pool; 

    try {
      // 2. Insert the Item
      const itemRes = await queryRunner.query(
        'INSERT INTO order_item (order_id, item_id, quantity, price, status) VALUES ($1,$2,$3,$4,$5) RETURNING order_item_id',
        [
          payload.order_id,
          payload.item_id,
          payload.quantity,
          payload.price,
          payload.status || 'INCOMING' 
        ]
      );
      const orderItemId = itemRes.rows[0].order_item_id;

      // 3. Insert Modifiers 
      if (payload.modifiers && payload.modifiers.length > 0) {
        for (const mod of payload.modifiers) {
          await queryRunner.query(
            `INSERT INTO order_item_modifiers (order_item_id, option_id, price_modifier, option_name)
             VALUES ($1, $2, $3, $4)`,
            [orderItemId, mod.option_id, mod.price, mod.name]
          );
        }
      }

      return successResponse(SuccessCodes.CREATED, itemRes.rows[0]);
    } catch (error) {
      // If we are NOT in a shared transaction, we should log here. 
      // If we ARE in a shared transaction, the caller (OrderService) will catch this.
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async update(id: number, payload: UpdateOrderItemPayload): Promise<ServiceResult<FetchOrderItemPayload>> {
    const entries = Object.entries(payload).filter(([key]) => ITEM_COLUMNS.has(key));
    if (entries.length === 0)
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'No valid fields to update');

    const setClause = entries.map(([field], i) => `${field} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v ?? null);

    try {
      const query = `UPDATE order_item SET ${setClause} WHERE order_item_id = $${
        entries.length + 1
      } RETURNING order_item_id`;
      const orderItemId = await BaseService.query(query, [...values, id]);
      if (!orderItemId.rows[0])
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
      const result = await this.findById(orderItemId.rows[0].order_item_id);
      return result;
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async updateStatus(id: number): Promise<ServiceResult<FetchOrderItemPayload>> {
    // Get status and order_id of the OrderItem
    const orderItemInfo = await BaseService.query(
      'SELECT status, order_id FROM order_item WHERE order_item_id = $1', [id]
    );
    if (!orderItemInfo.rows[0])
      return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
    const currStatus = orderItemInfo.rows[0].status;
    const orderId = orderItemInfo.rows[0].order_id;

    // Determine next status
    const nextStatus = NextOrderItemStatusMap[currStatus as OrderItemStatusCodes];
    if (!nextStatus)
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Order Item is already in final status');

    try {
      const orderItemId = await BaseService.query(
        'UPDATE order_item SET status = $1 WHERE order_item_id = $2 RETURNING order_item_id',
        [nextStatus, id]
      );
      OrderService.updateStatus(orderId); // Try to update order status as well
      const result = await this.findById(orderItemId.rows[0].order_item_id);
      return result;
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async cancel(id: number): Promise<ServiceResult<null>> {
    try {
      const orderItemId = await BaseService.query(
        'UPDATE order_item SET status = $1 WHERE order_item_id = $2 RETURNING order_item_id', 
        [OrderItemStatusCodes.CANCELLED, id]
      );
      if (orderItemId.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
      OrderService.updateStatus(orderItemId.rows[0].order_id); // Try to update order status as well
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query(
        'DELETE FROM order_item WHERE order_item_id = $1', 
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