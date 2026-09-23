import { Router } from 'express';
import {
  getSpeakers,
  getSpeakerById,
  createSpeaker,
  updateSpeaker,
  deleteSpeaker,
  uploadMaterial,
} from '../controllers/speakerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', getSpeakers);
router.get('/:id', getSpeakerById);

router.post(
  '/',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER'),
  createSpeaker
);

router.put('/:id', protect, updateSpeaker);

router.delete(
  '/:id',
  protect,
  authorizeRoles('PLATFORM_ADMIN', 'EVENT_ORGANIZER'),
  deleteSpeaker
);

router.post('/:id/materials', protect, uploadMaterial);

export default router;
