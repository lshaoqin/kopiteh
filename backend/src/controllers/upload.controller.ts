import { Request, Response } from 'express';
import uploadService from '../services/upload.service';
import { successResponse, errorResponse } from '../types/responses';
import { SuccessCodes } from '../types/success';
import { ErrorCodes } from '../types/errors';

export class UploadController {
  async uploadSingle(req: Request, res: Response) {
    if (!req.file) {
      const result = errorResponse(ErrorCodes.VALIDATION_ERROR, 'No file uploaded');
      return res.status(result.payload.status).json(result);
    }

    const folder = (req.body.folder as string) || 'images';
    const imageUrl = await uploadService.uploadImage(req.file, folder);

    const result = successResponse(SuccessCodes.OK, { imageUrl });
    return res.status(result.payload.status).json(result);
  }

  async uploadMultiple(req: Request, res: Response) {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      const result = errorResponse(ErrorCodes.VALIDATION_ERROR, 'No files uploaded');
      return res.status(result.payload.status).json(result);
    }

    const folder = (req.body.folder as string) || 'images';
    const imageUrls = await uploadService.uploadMultipleImages(req.files, folder);

    const result = successResponse(SuccessCodes.OK, { imageUrls });
    return res.status(result.payload.status).json(result);
  }

  async uploadBase64(req: Request, res: Response) {
    const { dataUri, folder } = req.body;

    if (!dataUri || typeof dataUri !== 'string' || !dataUri.startsWith('data:')) {
      const result = errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid or missing dataUri');
      return res.status(result.payload.status).json(result);
    }

    const imageUrl = await uploadService.uploadBase64Image(dataUri, folder || 'images');

    const result = successResponse(SuccessCodes.OK, { imageUrl });
    return res.status(result.payload.status).json(result);
  }
}

export default new UploadController();