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
import { OrderItemStatusCodes, NextOrderItemStatusMap, PreviousOrderItemStatusMap } from '../types/orderStatus';
import {MenuItemService} from "./menuItem.service";
import { OrderService } from './order.service';
import { WebSocketService } from './websocket.service';
import { PoolClient, Pool } from 'pg';

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

// --- Helper Fuction ---
async function findStandardById(id: number): Promise<FetchOrderItemResponsePayload> {
  try {    
    const result = await BaseService.query(
      `SELECT oi.order_item_id, m.stall_id, t.table_id, o.user_id, m.name as order_item_name, 
      oi.status, oi.quantity, oi.price, o.created_at, o.remarks, \'STANDARD\' AS type
      FROM order_item oi 
      JOIN menu_item m ON oi.item_id = m.item_id 
      JOIN "order" o ON oi.order_id = o.order_id 
      JOIN "table" t ON o.table_id = t.table_id 
      WHERE oi.order_item_id = $1 ORDER BY oi.order_item_id`,
      [id]
    );
    if (!result.rows[0]) {
      throw new Error('Order Item not found');
    }

    // 🔹 Fetch modifiers
    const modifiersResult = await BaseService.query(
      `
      SELECT 
        option_id,
        option_name AS name,
        price_modifier AS price
      FROM order_item_modifiers
      WHERE order_item_id = $1
      `,
      [id]
    )
    return {
      ...result.rows[0],
      modifiers: modifiersResult.rows, // OrderModifierPayload[]
    };
  } catch (error) {
    throw error;
  }
}

async function attachModifiers(
  items: FetchOrderItemResponsePayload[]
): Promise<FetchOrderItemResponsePayload[]> {
  if (items.length === 0) return items;

  const ids = items.map(i => i.order_item_id);

  const mods = await BaseService.query(
    `
    SELECT option_id, option_name AS name, price_modifier AS price
    FROM order_item_modifiers
    WHERE order_item_id = ANY($1)
    `,
    [ids]
  );

  const map = new Map<number, any[]>();
  for (const row of mods.rows) {
    if (!map.has(row.order_item_id)) {
      map.set(row.order_item_id, []);
    }
    map.get(row.order_item_id)!.push({
      option_id: row.option_id,
      name: row.name,
      price: row.price,
    });
  }

  return items.map(item => ({
    ...item,
    modifiers: map.get(item.order_item_id) ?? [],
  }));
}


// --- Service Object ---
export const OrderItemService = {
  async findByOrder(order_id: number): Promise<ServiceResult<FetchOrderItemResponsePayload[]>> {
    try {
      const result = await BaseService.query(
        `SELECT oi.order_item_id, m.stall_id, t.table_id, o.user_id, m.name as order_item_name, 
        oi.item_id, oi.status, oi.quantity, oi.price, o.created_at, o.remarks, 'STANDARD' AS type
        FROM order_item oi 
        JOIN menu_item m ON oi.item_id = m.item_id 
        JOIN "order" o ON oi.order_id = o.order_id 
        JOIN "table" t ON o.table_id = t.table_id 
        WHERE oi.order_id = $1 ORDER BY oi.order_item_id
        ORDER BY oi.order_item_id`,
        [order_id]
      );

      const result = await attachModifiers(baseItems.rows);
      return successResponse(SuccessCodes.OK, result);

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
      const standardOrderItemIds = await BaseService.query(
        `SELECT oi.order_item_id FROM order_item oi
        JOIN menu_item m ON oi.item_id = m.item_id
        WHERE m.stall_id = $1 ORDER BY oi.order_item_id`,
        [stall_id]
      );

      const standardResult = { rows: [] as FetchOrderItemResponsePayload[] };
      for (const row of standardOrderItemIds.rows) {
        const itemResult = await findStandardById(row.order_item_id);
        if (itemResult) {
          standardResult.rows.push(itemResult);
        }
      }

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

        result = await findStandardById(id);

        if (!result) {
          return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
        }

        return successResponse(SuccessCodes.OK, {...result});
      } else {
        result = await BaseService.query(
          'SELECT *, \'CUSTOM\' AS type FROM custom_order_item WHERE order_item_id = $1', 
          [id]
        );

        if (!result.rows[0]) {
          return errorResponse(ErrorCodes.NOT_FOUND, 'Custom Order Item not found');
        }
        return successResponse(SuccessCodes.OK, result.rows[0]);
      }
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(
    request: OrderItemPayload | CustomOrderItemPayload, 
    type: 'STANDARD' | 'CUSTOM'
  ): Promise<ServiceResult<any>> {

    try {
      let result = null;
      
      if (type === 'STANDARD') {
        const standardItemPayload = request as OrderItemPayload;
        
        // 2. Insert Item
        const orderItemRes  = await BaseService.query(
          `INSERT INTO order_item (order_id, item_id, quantity, price, status) 
          VALUES ($1, $2, $3, $4, 'INCOMING') RETURNING order_item_id`,
          [standardItemPayload.order_id, standardItemPayload.item_id, standardItemPayload.quantity, standardItemPayload.price]
        );
        const orderItemId = orderItemRes.rows[0].order_item_id;

        // 3. Insert Modifiers 
        if (standardItemPayload.modifiers && standardItemPayload.modifiers.length > 0) {
          for (const mod of standardItemPayload.modifiers) {
            await BaseService.query(
              `INSERT INTO order_item_modifiers (order_item_id, option_id, price_modifier, option_name)
              VALUES ($1, $2, $3, $4)`,
              [orderItemId, mod.option_id, mod.price, mod.name]
            );
          }
        } 
        result = await findStandardById(orderItemId);        
        // Send WebSocket notification
        WebSocketService.notifyStallOrderItemCreated(result.stall_id, result);
                return successResponse(SuccessCodes.CREATED, result);
        
      } else {
        const customItemPayload = request as CustomOrderItemPayload;
        result = await BaseService.query(
          `INSERT INTO custom_order_item (stall_id, table_id, user_id, order_item_name, status, quantity, price, created_at, remarks) 
          VALUES ($1,$2,$3,$4,'INCOMING',$5,$6,NOW(),$7) RETURNING *, \'CUSTOM\' AS type`,
          [
            customItemPayload.stall_id,
            customItemPayload.table_id,
            customItemPayload.user_id ?? null,
            customItemPayload.order_item_name,
            customItemPayload.quantity,
            customItemPayload.price,
            customItemPayload.remarks ?? null,
          ]
        );
        
        // Send WebSocket notification
        const customItem = result.rows[0];
        WebSocketService.notifyStallOrderItemCreated(customItem.stall_id, customItem);
        
        return successResponse(SuccessCodes.CREATED, customItem);
      }
    } catch (error) {
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
        const result = await findStandardById(orderItemId.rows[0].order_item_id);
        
        // Send WebSocket notification
        WebSocketService.notifyStallOrderItemUpdated(result.stall_id, result);
        
        return successResponse(SuccessCodes.OK, result);
      } else {
        const query = `UPDATE custom_order_item SET ${setClause} WHERE order_item_id = $${
          entries.length + 1
        } RETURNING *, \'CUSTOM\' AS type`;
        const result = await BaseService.query(query, [...values, id]);
        if (!result.rows[0])
          return errorResponse(ErrorCodes.NOT_FOUND, 'Custom Order Item not found');
        
        // Send WebSocket notification
        const customItem = result.rows[0];
        WebSocketService.notifyStallOrderItemUpdated(customItem.stall_id, customItem);
        
        return successResponse(SuccessCodes.OK, customItem);
      }
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async updateStatus(id: number, type: 'STANDARD' | 'CUSTOM'): Promise<ServiceResult<FetchOrderItemResponsePayload>> {
    // Get status and order_id of the OrderItem
    let currStatus;
    if (type === 'STANDARD') {
      currStatus = await BaseService.query(
        'SELECT status FROM order_item WHERE order_item_id = $1', [id]
      );
    } else {
      currStatus = await BaseService.query(
        'SELECT status FROM custom_order_item WHERE order_item_id = $1', [id]
      );
    }
    if (!currStatus.rows[0])
      return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');

    // Determine next status
    const nextStatus = NextOrderItemStatusMap[currStatus.rows[0].status as OrderItemStatusCodes];
    if (!nextStatus)
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Order Item is already in final status');

    try {
      if (type === 'STANDARD') {
        const updateResult = await BaseService.query(
          'UPDATE order_item SET status = $1 WHERE order_item_id = $2 RETURNING order_item_id, order_id',
          [nextStatus, id]
        );
        OrderService.updateStatus(updateResult.rows[0].order_id); // Try to update order status as well
        const result = await findStandardById(updateResult.rows[0].order_item_id);
        
        // Send WebSocket notification
        WebSocketService.notifyStallOrderItemUpdated(result.stall_id, result);
        
        return successResponse(SuccessCodes.OK, result);
      } else {
        const result = await BaseService.query(
          'UPDATE custom_order_item SET status = $1 WHERE order_item_id = $2 RETURNING *, \'CUSTOM\' AS type',
          [nextStatus, id]
        );
        
        // Send WebSocket notification
        const customItem = result.rows[0];
        WebSocketService.notifyStallOrderItemUpdated(customItem.stall_id, customItem);
        
        return successResponse<FetchOrderItemResponsePayload>(SuccessCodes.OK, customItem);
      }
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async revertStatus(id: number, type: 'STANDARD' | 'CUSTOM'): Promise<ServiceResult<FetchOrderItemResponsePayload>> {
    try {
      if (type === 'STANDARD') {
        const currStatus = await BaseService.query(
          'SELECT status FROM order_item WHERE order_item_id = $1',
          [id]
        );
        const prevStatus = PreviousOrderItemStatusMap[currStatus.rows[0].status as OrderItemStatusCodes];
        if (!prevStatus) {
          return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Cannot revert from current status');
        }
        const updateResult = await BaseService.query(
          'UPDATE order_item SET status = $1 WHERE order_item_id = $2 RETURNING order_item_id, order_id',
          [prevStatus, id]
        );
        const result = await findStandardById(updateResult.rows[0].order_item_id);
        
        // Send WebSocket notification
        WebSocketService.notifyStallOrderItemUpdated(result.stall_id, result);
        
        return successResponse(SuccessCodes.OK, result);
      } else {
        const currStatus = await BaseService.query(
          'SELECT status FROM custom_order_item WHERE order_item_id = $1',
          [id]
        );
        const prevStatus = PreviousOrderItemStatusMap[currStatus.rows[0].status as OrderItemStatusCodes];
        if (!prevStatus) {
          return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Cannot revert from current status');
        }
        const result = await BaseService.query(
          'UPDATE custom_order_item SET status = $1 WHERE order_item_id = $2 RETURNING *, \'CUSTOM\' AS type',
          [prevStatus, id]
        );
        
        // Send WebSocket notification
        const customItem = result.rows[0];
        WebSocketService.notifyStallOrderItemUpdated(customItem.stall_id, customItem);
        
        return successResponse<FetchOrderItemResponsePayload>(SuccessCodes.OK, customItem);
      }
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async cancel(id: number, type: 'STANDARD' | 'CUSTOM'): Promise<ServiceResult<FetchOrderItemResponsePayload>> {
    try {
      if (type === 'STANDARD') {
        const ids = await BaseService.query(
          'UPDATE order_item SET status = $1 WHERE order_item_id = $2 RETURNING order_item_id, order_id', 
          [OrderItemStatusCodes.CANCELLED, id]
        );
        OrderService.updateStatus(ids.rows[0].order_id); // Try to update order status as well
        const result = await findStandardById(ids.rows[0].order_item_id);
        return successResponse(SuccessCodes.OK, result);
      } else {
        const result = await BaseService.query(
          'UPDATE custom_order_item SET status = $1 WHERE order_item_id = $2 RETURNING *, \'CUSTOM\' AS type',
          [OrderItemStatusCodes.CANCELLED, id]
        );
        if (result.rowCount === 0)
          return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
        return successResponse<FetchOrderItemResponsePayload>(SuccessCodes.OK, result.rows[0]);
      }      
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

  async findModifiersByOrderItem(orderItemId: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        `SELECT order_item_option_id, option_id, price_modifier, option_name
         FROM order_item_modifiers
         WHERE order_item_id = $1`,
        [orderItemId]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};