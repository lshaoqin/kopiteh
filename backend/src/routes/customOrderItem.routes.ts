import { Router } from 'express';
import { CustomOrderItemController } from '../controllers/customOrderItem.controller';
import {
  createCustomOrderItemValidation,
  updateCustomOrderItemValidation,
  customOrderItemIdParamValidation,
  stallIdParamValidation,
  userIdParamValidation,
} from '../middleware/customOrderItem.validation'
import { runValidation } from '../middleware/base.validation';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public reads
router.get('/customOrderItem/:id', customOrderItemIdParamValidation, runValidation, CustomOrderItemController.getById);
router.get('/customOrderItem/user/:user_id', userIdParamValidation, runValidation, CustomOrderItemController.getByUser);
router.get('/customOrderItem/stall/:stall_id', stallIdParamValidation, runValidation, CustomOrderItemController.getByStall);

// Public writes
router.put('/customOrderItem/update/:id', ...updateCustomOrderItemValidation, runValidation, CustomOrderItemController.update);
router.put('/customOrderItem/updateStatus/:id', ...updateCustomOrderItemValidation, runValidation, CustomOrderItemController.updateStatus);
router.put('/customOrderItem/cancel/:id', customOrderItemIdParamValidation, runValidation, CustomOrderItemController.cancel);
router.post('/customOrderItem/create', createCustomOrderItemValidation, runValidation, CustomOrderItemController.create);

export default router;