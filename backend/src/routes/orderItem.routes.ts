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
router.get('/order/:order_id/orderItem', orderItemIdParamValidation, OrderItemController.getAllByOrder);
router.get('/stall/:stall_id/orderItem', orderItemIdParamValidation, OrderItemController.getAllByStall);
router.get('/orderItem/:id', orderItemIdParamValidation, runValidation, OrderItemController.getById);

// Protected writes
router.post('/orderItem', authenticateToken, createOrderItemValidation, runValidation, OrderItemController.create);
router.put('/orderItem/:id', authenticateToken, updateOrderItemValidation, runValidation, OrderItemController.update);
router.delete('/orderItem/:id', authenticateToken, orderItemIdParamValidation, runValidation, OrderItemController.remove);

export default router;