import { Router } from 'express';
import { OrderItemController } from '../controllers/orderItem.controller';
import {
  createOrderItemValidation,
  updateOrderItemValidation,
  orderItemIdParamValidation,
  runValidation,
} from '../middleware/orderItem.validation'
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public reads
router.get('/orderItem/:id', orderItemIdParamValidation, runValidation, OrderItemController.getById);
router.get('/orderItem/order/:order_id', orderItemIdParamValidation, OrderItemController.getByOrder);
router.get('/stall/:stall_id/orderItem', orderItemIdParamValidation, OrderItemController.getByStall);

// Public writes
router.put('/orderItem/:id', authenticateToken, updateOrderItemValidation, runValidation, OrderItemController.update);
router.put('/orderItem/:id/updateStatus', authenticateToken, updateOrderItemValidation, runValidation, OrderItemController.updateStatus);
router.put('/orderItem/:id', authenticateToken, orderItemIdParamValidation, runValidation, OrderItemController.cancel);
router.post('/orderItem', authenticateToken, createOrderItemValidation, runValidation, OrderItemController.create);

export default router;