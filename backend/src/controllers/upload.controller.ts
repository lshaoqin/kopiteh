import type { Request, Response } from "express";
import { createPresignedUpload } from "../services/s3.service";
import { successResponse, errorResponse } from "../types/responses";
import { SuccessCodes } from "../types/success";
import { ErrorCodes } from "../types/errors";

export const UploadController = {
  async presign(req: Request, res: Response) {
    const { filename, contentType, folder } = req.body ?? {};
    if (!filename || !contentType) {
      const result = errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        "filename and contentType are required"
      );
      return res.status(result.payload.status).json(result);
    }

    const { uploadUrl, publicUrl } = await createPresignedUpload({
      filename,
      contentType,
      folder,
    });

    const result = successResponse(SuccessCodes.OK, { uploadUrl, publicUrl });
    return res.status(result.payload.status).json(result);
  },
};
