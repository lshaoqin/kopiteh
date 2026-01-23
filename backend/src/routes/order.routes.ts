import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import {
  createOrderValidation,
  updateOrderValidation,
  orderIdParamValidation,
  userIdParamValidation,
  analyticsQueryValidation,
} from '../middleware/order.validation'
import { runValidation } from '../middleware/base.validation';

const router = Router();

// Public reads
router.get('/order/:id', orderIdParamValidation, runValidation, OrderController.getById);
router.get('/order/user/:user_id', userIdParamValidation, runValidation, OrderController.getByUser);
router.get('/order/user/:user_id', orderIdParamValidation, runValidation, OrderController.getByUser);
router.get('/order/analytics/monthly', authenticateToken, analyticsQueryValidation, runValidation, OrderController.getMonthlyAnalytics);

// Public writes
router.post('/order/create', createOrderValidation, runValidation, OrderController.create); // removed authenticateToken because no logins
router.put('/order/update/:id', authenticateToken, ...updateOrderValidation, runValidation, OrderController.update);
router.put('/order/cancel/:id', authenticateToken, orderIdParamValidation, runValidation, OrderController.cancel);

export default router;