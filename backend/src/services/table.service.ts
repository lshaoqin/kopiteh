import type { TablePayload } from "../types/payloads";
import type { ServiceResult } from "../types/responses";
import { BaseService } from "./base.service";
import { successResponse, errorResponse } from "../types/responses";
import { ErrorCodes } from "../types/errors";
import { SuccessCodes } from "../types/success";

export const TableService = {
  async findAllByVenue(venue_id: number): Promise<ServiceResult<any[]>> {
    try {
      const result = await BaseService.query(
        'SELECT * FROM "table" WHERE venue_id = $1 ORDER BY table_number::INTEGER ASC',
        [venue_id]
      );
      return successResponse(SuccessCodes.OK, result.rows);
    } catch (error) {
      console.error("[TableService.findAllByVenue] DB error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async findById(id: number): Promise<ServiceResult<any>> {
    try {
      const result = await BaseService.query(
        'SELECT * FROM "table" WHERE table_id = $1',
        [id]
      );
      if (!result.rows[0]) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Table not found");
      }
      return successResponse(SuccessCodes.OK, result.rows[0]);
    } catch (error) {
      console.error("[TableService.findById] DB error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async create(payload: TablePayload): Promise<ServiceResult<any>> {
    try {
      const query = `
        INSERT INTO "table" (venue_id, table_number, qr_code)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await BaseService.query(query, [
        payload.venue_id,
        payload.table_number,
        payload.qr_code,
      ]);
      return successResponse(SuccessCodes.CREATED, result.rows[0]);
    } catch (error) {
      console.error("[TableService.create] DB error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async createBulk(venue_id: number, startNum: number, endNum: number): Promise<ServiceResult<any[]>> {
    try {
      const tables: any[] = [];
      
      for (let i = startNum; i <= endNum; i++) {
        const tableNumber = String(i);
        const qrCode = `qr-${venue_id}-${tableNumber}-${Date.now()}`;
        
        const query = `
          INSERT INTO "table" (venue_id, table_number, qr_code)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        const result = await BaseService.query(query, [venue_id, tableNumber, qrCode]);
        tables.push(result.rows[0]);
      }
      
      return successResponse(SuccessCodes.CREATED, tables);
    } catch (error) {
      console.error("[TableService.createBulk] DB error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async delete(id: number): Promise<ServiceResult<null>> {
    try {
      const result = await BaseService.query(
        'DELETE FROM "table" WHERE table_id = $1',
        [id]
      );
      if (result.rowCount === 0) {
        return errorResponse(ErrorCodes.NOT_FOUND, "Table not found");
      }
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      console.error("[TableService.delete] DB error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },

  async deleteBulk(venue_id: number, tableNumbers: string[]): Promise<ServiceResult<null>> {
    try {
      const query = `
        DELETE FROM "table" 
        WHERE venue_id = $1 AND table_number = ANY($2)
      `;
      await BaseService.query(query, [venue_id, tableNumbers]);
      return successResponse<null>(SuccessCodes.OK, null);
    } catch (error) {
      console.error("[TableService.deleteBulk] DB error:", error);
      return errorResponse(ErrorCodes.DATABASE_ERROR, String(error));
    }
  },
};
