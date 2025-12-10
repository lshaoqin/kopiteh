import type { StallPayload, UpdateStallPayload } from "../types/payloads";
import type { ServiceResult } from "../types/responses";
import { BaseService } from "./base.service";
import { successResponse, errorResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";
import { SuccessCodes } from "../types/success";

const STALL_COLUMNS = new Set([
  "venue_id",
  "name",
  "description",
  "stall_image",
  "is_open",
  "waiting_time",
]);

export const StallService = {
  async findAllByVenue(venue_id: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        "SELECT * FROM stall WHERE venue_id = $1 ORDER BY stall_id",
        [venue_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      console.error("[StallService.findAllByVenue] DB error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        "SELECT * FROM stall WHERE stall_id = $1",
        [id]
      );

      const stall = result.rows[0];
      if (!stall) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Stall not found");
      }

      return successResponse(SuccessCodes.OK, stall);
    } catch (error) {
      console.error("[StallService.findById] DB error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: StallPayload): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        "INSERT INTO stall (venue_id, name, description, stall_image, is_open, waiting_time) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
        [
          payload.venue_id,
          payload.name,
          payload.description ?? null,
          payload.stall_image ?? null,
          payload.is_open ?? true,
          payload.waiting_time ?? 0,
        ]
      );
      return successResponse(SuccessCodes.CREATED, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async update(
    id: number,
    payload: UpdateStallPayload
  ): Promise<ServiceResult<any>> {
    const entries = Object.entries(payload).filter(([key]) =>
      STALL_COLUMNS.has(key)
    );
    if (entries.length === 0)
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        "No valid fields to update"
      );

    const setClause = entries
      .map(([field], i) => `${field} = $${i + 1}`)
      .join(", ");
    const values = entries.map(([, value]) => value ?? null);

    try {
      const query = `UPDATE stall SET ${setClause} WHERE stall_id = $${
        entries.length + 1
      } RETURNING *`;
      const result = await BaseService.query(query, [...values, id]);
      if (!result.rows[0])
        return errorResponse(ErrorCodes.NOT_FOUND, "Stall not found");
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query(
        "DELETE FROM stall WHERE stall_id = $1",
        [id]
      );
      if (result.rowCount === 0)
        return errorResponse(ErrorCodes.NOT_FOUND, "Stall not found");
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};
