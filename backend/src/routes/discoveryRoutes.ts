import { Router } from 'express';
import { getDiscoveries, saveDiscovery, identifyWithAiService } from '../controllers/discoveryController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getDiscoveries);
router.post('/', saveDiscovery);
router.post('/identify', identifyWithAiService);

export default router;
