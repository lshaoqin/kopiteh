import { Router } from 'express';
import { VenueController } from '../controllers/venue.controller';
import {
  createVenueValidation,
  runValidation,
  updateVenueValidation,
  venueIdParamValidation,
} from '../middleware/venue.validation';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', VenueController.getAll);
router.get('/:id', venueIdParamValidation, runValidation, VenueController.getById);
router.post('/', authenticateToken, createVenueValidation, runValidation, VenueController.create);
router.put(
  '/:id',
  authenticateToken,
  ...updateVenueValidation,
  runValidation,
  VenueController.update,
);
router.delete('/:id', authenticateToken, venueIdParamValidation, runValidation, VenueController.remove);

export default router;
