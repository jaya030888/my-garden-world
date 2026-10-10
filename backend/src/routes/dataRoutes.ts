import { Router } from 'express';
import { exportUserData, importUserData, getUserProfile } from '../controllers/dataController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/profile', getUserProfile);
router.get('/export', exportUserData);
router.post('/import', importUserData);

export default router;
