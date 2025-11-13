import type { OrderItemPayload } from '../types/payloads';
import type { ServiceResult } from '../types/responses';
import { BaseService } from './base.service';
import { successResponse, errorResponse } from '../types/responses';
import { ErrorCodes } from '../types/errors';
import { SuccessCodes } from '../types/success';

const ITEM_COLUMNS = new Set([
  'order_id',
  'item_id',
  'stall_id',
  'quantity',
  'price',
]);

export const MenuItemService = {
  async findAllByStall(order_id: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        'SELECT * FROM Order_Item WHERE stall_id = $1 ORDER BY order_id',
        [order_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query('SELECT * Order_Item WHERE item_id = $1', [id]);
      if (!result.rows[0]) return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: OrderItemPayload): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        'INSERT INTO Order_Item (order_id, item_id, stall_id, quantity, price) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [
          payload.order_id,
          payload.item_id,
          payload.stall_id,
          payload.quantity,
          payload.price,
        ]
      );
      return successResponse(SuccessCodes.CREATED, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async update(id: number, payload: OrderItemPayload): Promise<ServiceResult<any>> {
    const entries = Object.entries(payload).filter(([key]) => ITEM_COLUMNS.has(key));
    if (entries.length === 0)
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'No valid fields to update');

    const setClause = entries.map(([field], i) => `${field} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v ?? null);

    try {
      const query = `UPDATE Order_Item SET ${setClause} WHERE item_id = $${
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

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query('DELETE FROM Order_Item WHERE item_id = $1', [id]);
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, 'Order Item not found');
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};