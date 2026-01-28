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
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public reads
router.get('/order/:id', orderIdParamValidation, runValidation, OrderController.getById);
router.get('/order/user/:user_id', userIdParamValidation, runValidation, OrderController.getByUser);
router.get('/order/analytics/monthly', authenticateToken, analyticsQueryValidation, runValidation, OrderController.getMonthlyAnalytics);

// Public writes
interface RequestWithTraceId extends Request {
  traceId?: string;
}

router.post('/order/create', createOrderValidation, runValidation, OrderController.create); // removed authenticateToken because no logins
router.put('/order/update/:id', ...updateOrderValidation, runValidation, OrderController.update);
router.put('/order/cancel/:id', orderIdParamValidation, runValidation, OrderController.cancel);

export default router;