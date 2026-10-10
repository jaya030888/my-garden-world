import { Router } from 'express';
import { getShopItems, purchaseItem } from '../controllers/shopController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/items', getShopItems);
router.post('/buy', purchaseItem);

export default router;
