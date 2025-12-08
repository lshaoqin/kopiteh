import { Router } from 'express';
import { OrderItemController } from '../controllers/orderItem.controller';
import {
  createOrderItemValidation,
  updateOrderItemValidation,
  orderItemIdParamValidation,
} from '../middleware/orderItem.validation'
import { runValidation } from '../middleware/base.validation';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public reads
router.get('/orderItem/:id', orderItemIdParamValidation, runValidation, OrderItemController.getById);
router.get('/orderItem/order/:order_id', orderItemIdParamValidation, OrderItemController.getByOrder);
router.get('/orderItem/stall/:stall_id', orderItemIdParamValidation, OrderItemController.getByStall); // for runners

// Public writes
router.put('/orderItem/update/:id', authenticateToken, ...updateOrderItemValidation, runValidation, OrderItemController.update);
router.put('/orderItem/updateStatus/:id', authenticateToken, ...updateOrderItemValidation, runValidation, OrderItemController.updateStatus);
router.put('/orderItem/cancel/:id', authenticateToken, orderItemIdParamValidation, runValidation, OrderItemController.cancel);
router.post('/orderItem/create', authenticateToken, createOrderItemValidation, runValidation, OrderItemController.create);

export default router;