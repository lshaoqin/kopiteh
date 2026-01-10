import type { MenuItemPayload, UpdateMenuItemPayload } from "../types/payloads";
import type { ServiceResult } from "../types/responses";
import { BaseService } from "./base.service";
import { successResponse, errorResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";
import { SuccessCodes } from "../types/success";

const ITEM_COLUMNS = new Set([
  "stall_id",
  "category_id",
  "item_image",
  "name",
  "description",
  "price",
  "prep_time",
  "is_available",
]);

export const MenuItemService = {
  async findAllByStall(
    stall_id: number,
    category_id?: number
  ): Promise<ServiceResult<any[]>> {
    try {
      const hasCategoryFilter =
        typeof category_id === "number" && !Number.isNaN(category_id);

      const result = await BaseService.query(
        hasCategoryFilter
          ? `SELECT * FROM menu_item WHERE stall_id = $1 AND category_id = $2 ORDER BY item_id ASC`
          : `SELECT * FROM menu_item WHERE stall_id = $1 ORDER BY item_id ASC`,
        hasCategoryFilter ? [stall_id, category_id] : [stall_id]
      );

      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        "SELECT * FROM menu_item WHERE item_id = $1",
        [id]
      );

      if (!result.rows[0]) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Menu item not found");
      }

      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: MenuItemPayload): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        `INSERT INTO menu_item (stall_id, category_id, item_image, name, description, price, prep_time, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
        [
          payload.stall_id,
          payload.category_id ?? null,
          payload.item_image ?? null,
          payload.name,
          payload.description ?? null,
          payload.price,
          payload.prep_time ?? 0,
          payload.is_available ?? true,
        ]
      );

      return successResponse(SuccessCodes.CREATED, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async update(
    id: number,
    payload: UpdateMenuItemPayload
  ): Promise<ServiceResult<any>> {
    const entries = Object.entries(payload).filter(([key]) =>
      ITEM_COLUMNS.has(key)
    );
    if (entries.length === 0) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        "No valid fields to update"
      );
    }

    const setClause = entries
      .map(([field], i) => `${field} = $${i + 1}`)
      .join(", ");
    const values = entries.map(([, v]) => v ?? null);

    try {
      const query = `UPDATE menu_item SET ${setClause} WHERE item_id = $${
        entries.length + 1
      } RETURNING *`;
      const result = await BaseService.query(query, [...values, id]);

      if (!result.rows[0]) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Menu item not found");
      }

      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query(
        "DELETE FROM menu_item WHERE item_id = $1",
        [id]
      );

      if (result.rowCount === 0) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Menu item not found");
      }

      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};
