import { Router } from 'express';
import uploadController from '../controllers/upload.controller';
import { upload } from '../middleware/upload.middleware';
import { asyncHandler } from '../middleware/async.handler';

const router = Router();

router.post(
  '/single',
  upload.single('image'),
  asyncHandler(uploadController.uploadSingle.bind(uploadController))
);

router.post(
  '/multiple',
  upload.array('images', 10),
  asyncHandler(uploadController.uploadMultiple.bind(uploadController))
);

export default router;