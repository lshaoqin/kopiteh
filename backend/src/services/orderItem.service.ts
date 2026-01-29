import type { 
  CustomOrderItemPayload, 
  FetchOrderItemResponsePayload, 
  OrderItemPayload, 
  UpdateCustomOrderItemPayload, 
  UpdateOrderItemPayload 
} from '../types/payloads';
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

const STANDARD_ITEM_COLUMNS = new Set([
  'order_id',
  'item_id',
  'quantity',
  'price',
]);

const CUSTOM_ITEM_COLUMNS = new Set([
  'stall_id',
  'table_id',
  'user_id',
  'order_item_name',
  'status',
  'quantity',
  'price',
  'remarks',
]);

export const OrderItemService = {
  async findByOrder(order_id: number): Promise<ServiceResult<FetchOrderItemResponsePayload[]>> {
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

  async findByStall(stall_id: number): Promise<ServiceResult<FetchOrderItemResponsePayload[]>> {
    try {
      const stallItems = await MenuItemService.findAllByStall(stall_id);
      if (!stallItems.success) {
        return errorResponse(ErrorCodes.DATABASE_ERROR, stallItems.payload.message);
      } else if (stallItems.payload.data === null) {
        return successResponse(SuccessCodes.OK, []); 
      }
      const standardResult = await BaseService.query(
        `SELECT m.stall_id, t.table_id, o.user_id, m.name as order_item_name, 
        oi.status, oi.quantity, oi.price, o.created_at, o.remarks, \'STANDARD\' AS type
        FROM order_item oi 
        JOIN menu_item m ON oi.item_id = m.item_id 
        JOIN "order" o ON oi.order_id = o.order_id 
        JOIN "table" t ON o.table_id = t.table_id 
        WHERE m.stall_id = $1 ORDER BY oi.order_item_id`,
        [stall_id]
      );

      const customResult = await BaseService.query(
        'SELECT *, \'CUSTOM\' AS type FROM custom_order_item WHERE stall_id = $1 ORDER BY order_item_id',
        [stall_id]
      );
      return successResponse(SuccessCodes.OK, [...standardResult.rows, ...customResult.rows]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number, type: 'STANDARD' | 'CUSTOM'): Promise<ServiceResult<FetchOrderItemResponsePayload>> {
    try {
      let result;
      if (type === 'STANDARD') {
        result = await BaseService.query(
          `SELECT m.stall_id, t.table_id, o.user_id, m.name as order_item_name, 
          oi.status, oi.quantity, oi.price, o.created_at, o.remarks, \'STANDARD\' AS type
          FROM order_item oi 
          JOIN menu_item m ON oi.item_id = m.item_id 
          JOIN "order" o ON oi.order_id = o.order_id 
          JOIN "table" t ON o.table_id = t.table_id 
          WHERE oi.order_item_id = $1 ORDER BY oi.order_item_id`,
          [id]
        );
      } else {
        result = await BaseService.query(
          'SELECT *, \'CUSTOM\' AS type FROM custom_order_item WHERE order_item_id = $1', 
          [id]
        );
      }
      if (!result.rows[0]) 
        return errorResponse(ErrorCodes.NOT_FOUND, type=='STANDARD' ? 'Order Item not found' : 'Custom Order Item not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(
    payload: OrderItemPayload | CustomOrderItemPayload, 
    type: 'STANDARD' | 'CUSTOM',
    client?: PoolClient
  ): Promise<ServiceResult<any>> {
    // 1. Determine which "Query Runner" to use
    // If a transaction client is passed, use it. Otherwise, use the global pool.
    const queryRunner = client || pool; 

    try {
      let itemRes;
      if (type === 'STANDARD') {
        const standardItemPayload = payload as OrderItemPayload;
        // 2. Insert the Item
        itemRes = await queryRunner.query(
          'INSERT INTO order_item (order_id, item_id, quantity, price, status) VALUES ($1,$2,$3,$4,$5) RETURNING order_item_id',
          [
            standardItemPayload.order_id,
            standardItemPayload.item_id,
            standardItemPayload.quantity,
            standardItemPayload.price,
            standardItemPayload.status || 'INCOMING' 
          ]
        );
        const orderItemId = itemRes.rows[0].order_item_id;

        // 3. Insert Modifiers 
        if (standardItemPayload.modifiers && standardItemPayload.modifiers.length > 0) {
          for (const mod of standardItemPayload.modifiers) {
            await queryRunner.query(
              `INSERT INTO order_item_modifiers (order_item_id, option_id, price_modifier, option_name)
              VALUES ($1, $2, $3, $4)`,
              [orderItemId, mod.option_id, mod.price, mod.name]
            );
          }
        } else {
          const customItemPayload = payload as CustomOrderItemPayload;
          itemRes = await BaseService.query(
            `INSERT INTO custom_order_item (stall_id, table_id, user_id, order_item_name, status, quantity, price, created_at, remarks) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *, \'CUSTOM\' AS type`,
            [
              customItemPayload.stall_id,
              customItemPayload.table_id,
              customItemPayload.user_id ?? null,
              customItemPayload.order_item_name,
              customItemPayload.status,
              customItemPayload.quantity,
              customItemPayload.price,
              customItemPayload.created_at,
              customItemPayload.remarks ?? null,
            ]
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

  async update(
    id: number, 
    payload: UpdateOrderItemPayload | UpdateCustomOrderItemPayload, 
    type: 'STANDARD' | 'CUSTOM'
  ): Promise<ServiceResult<FetchOrderItemResponsePayload>> {
    let entries: [string, any][];
    if (type === 'STANDARD') {
      entries = Object.entries(payload).filter(([key]) => STANDARD_ITEM_COLUMNS.has(key));
    } else {
      entries = Object.entries(payload).filter(([key]) => CUSTOM_ITEM_COLUMNS.has(key));
    }
    if (entries.length === 0)
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'No valid fields to update');

    const setClause = entries.map(([field], i) => `${field} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v ?? null);

    try {
      if (type === 'STANDARD') {
        const query = `UPDATE order_item SET ${setClause} WHERE order_item_id = $${
          entries.length + 1
        } RETURNING order_item_id`;
        const orderItemId = await BaseService.query(query, [...values, id]);
        if (!orderItemId.rows[0])
          return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
        const result = await this.findById(orderItemId.rows[0].order_item_id, 'STANDARD');
        return result;
      } else {
        const query = `UPDATE custom_order_item SET ${setClause} WHERE order_item_id = $${
          entries.length + 1
        } RETURNING *, \'CUSTOM\' AS type`;
        const result = await BaseService.query(query, [...values, id]);
        if (!result.rows[0])
          return errorResponse(ErrorCodes.NOT_FOUND, 'Custom Order Item not found');
        return successResponse(SuccessCodes.OK, result.rows[0]);
      }
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async updateStatus(id: number, type: 'STANDARD' | 'CUSTOM'): Promise<ServiceResult<FetchOrderItemResponsePayload>> {
    // Get status and order_id of the OrderItem
    let orderItemInfo;
    if (type === 'STANDARD') {
      orderItemInfo = await BaseService.query(
        'SELECT status, order_id FROM order_item WHERE order_item_id = $1', [id]
      );
    } else {
      orderItemInfo = await BaseService.query(
        'SELECT status, custom_order_id FROM custom_order_item WHERE order_item_id = $1', [id]
      );
    }
    if (!orderItemInfo.rows[0])
      return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
    const currStatus = orderItemInfo.rows[0].status;
    const orderId = orderItemInfo.rows[0].order_id;

    // Determine next status
    const nextStatus = NextOrderItemStatusMap[currStatus as OrderItemStatusCodes];
    if (!nextStatus)
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Order Item is already in final status');

    try {
      let result;
      if (type === 'STANDARD') {
        const orderItemId = await BaseService.query(
          'UPDATE order_item SET status = $1 WHERE order_item_id = $2 RETURNING order_item_id',
          [nextStatus, id]
        );
        OrderService.updateStatus(orderId); // Try to update order status as well
        result = await this.findById(orderItemId.rows[0].order_item_id, 'STANDARD');
      } else {
        result = await BaseService.query(
          'UPDATE custom_order_item SET status = $1 WHERE order_item_id = $2 RETURNING *, \'CUSTOM\' AS type',
          [nextStatus, id]
        );
      }
      return result;
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async cancel(id: number, type: 'STANDARD' | 'CUSTOM'): Promise<ServiceResult<FetchOrderItemResponsePayload>> {
    try {
      let result;
      if (type === 'STANDARD') {
        const orderItemId = await BaseService.query(
          'UPDATE order_item SET status = $1 WHERE order_item_id = $2 RETURNING order_item_id', 
          [OrderItemStatusCodes.CANCELLED, id]
        );
        result = await this.findById(orderItemId.rows[0].order_item_id, 'STANDARD');
      } else {
        result = await BaseService.query(
          'UPDATE custom_order_item SET status = $1 WHERE order_item_id = $2 RETURNING *, \'CUSTOM\' AS type',
          [OrderItemStatusCodes.CANCELLED, id]
        );
      }
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
      if (type === 'STANDARD')
        OrderService.updateStatus(result.rows[0].order_id); // Try to update order status as well
      return successResponse<FetchOrderItemResponsePayload>(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number, type: 'STANDARD' | 'CUSTOM'): Promise<ServiceResult<null>> {
    try {
      let result;
      if (type === 'STANDARD') {
        result = await BaseService.query(
          'DELETE FROM order_item WHERE order_item_id = $1', 
          [id]
        );
      } else {
        result = await BaseService.query(
          'DELETE FROM custom_order_item WHERE order_item_id = $1', 
          [id]
        );
      }
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};