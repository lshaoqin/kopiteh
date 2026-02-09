import { Router } from 'express';
import { TableController } from '../controllers/table.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { param } from 'express-validator';
import { runValidation } from '../middleware/base.validation';

const router = Router();

const venueIdParamValidation = [
  param("venue_id")
    .exists().withMessage("venue_id is required")
    .isInt({ min: 1 }).withMessage("venue_id must be a positive integer"),
];

const tableIdParamValidation = [
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
];

// Public reads
router.get('/tables/venue/:venue_id', venueIdParamValidation, runValidation, TableController.getAll);
router.get('/tables/:id', tableIdParamValidation, runValidation, TableController.getById);

// Protected writes
router.post('/tables/create', authenticateToken, TableController.create);
router.post('/tables/create-bulk', authenticateToken, TableController.createBulk);
router.delete('/tables/remove/:id', authenticateToken, tableIdParamValidation, runValidation, TableController.remove);
router.delete('/tables/remove-bulk', authenticateToken, TableController.removeBulk);

export default router;
