import { Router } from 'express';
import { getQuests, claimQuestReward } from '../controllers/questController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getQuests);
router.post('/:id/claim', claimQuestReward);

export default router;
