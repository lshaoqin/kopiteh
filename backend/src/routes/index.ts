import { Router } from 'express';

import authRoutes from './auth.routes';
import venueRoutes from './venue.routes';
import stallRoutes from './stall.routes';
import menuItemRoutes from './menuItem.routes';
import menuItemModifierSectionRoutes from './menuItemModifierSection.routes';
import menuItemModifierRoutes from './menuItemModifier.routes';
import menuItemCategoryRoutes from './menuItemCategory.routes'
import orderRoutes from './order.routes';
import orderItemRoutes from './orderItem.routes';

const router = Router();

router.use(authRoutes);
router.use(venueRoutes);
router.use(stallRoutes);
router.use(menuItemRoutes);
router.use(menuItemModifierSectionRoutes);
router.use(menuItemModifierRoutes);
router.use(orderRoutes);
router.use(orderItemRoutes);
router.use(menuItemCategoryRoutes);

export default router;
