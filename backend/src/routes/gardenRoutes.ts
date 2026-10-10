import { Router } from 'express';
import {
  getGardenLayout,
  placeGardenItem,
  moveGardenItem,
  rotateGardenItem,
  removeGardenItem,
} from '../controllers/gardenController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/layout', getGardenLayout);
router.post('/place', placeGardenItem);
router.put('/items/:instanceId', moveGardenItem);
router.patch('/items/:instanceId/rotate', rotateGardenItem);
router.delete('/items/:instanceId', removeGardenItem);

export default router;
