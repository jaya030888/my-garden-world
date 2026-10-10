import { Router } from 'express';
import {
  getPlants,
  getPlantById,
  createPlant,
  deletePlant,
  logPlantCare,
  addGrowthPhoto,
} from '../controllers/plantController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getPlants);
router.post('/', createPlant);
router.get('/:id', getPlantById);
router.delete('/:id', deletePlant);
router.post('/:id/care', logPlantCare);
router.post('/:id/growth', addGrowthPhoto);

export default router;
