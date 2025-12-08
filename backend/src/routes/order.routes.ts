import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import {
  createOrderValidation,
  updateOrderValidation,
  orderIdParamValidation,
} from '../middleware/order.validation'
import { runValidation } from '../middleware/base.validation';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public reads
router.get('/order/:id', orderIdParamValidation, runValidation, OrderController.getById);
router.get('/order/user/:user_id', orderIdParamValidation, runValidation, OrderController.getByUser);

// Public writes
router.post('/order/create', authenticateToken, createOrderValidation, runValidation, OrderController.create);
router.put('/order/update/:id', authenticateToken, ...updateOrderValidation, runValidation, OrderController.update);
router.put('/order/cancel/:id', authenticateToken, orderIdParamValidation, runValidation, OrderController.cancel);

export default router;