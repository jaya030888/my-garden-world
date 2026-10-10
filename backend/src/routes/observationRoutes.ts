import { Router } from 'express';
import { getObservations, createObservation } from '../controllers/observationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getObservations);
router.post('/', createObservation);

export default router;
