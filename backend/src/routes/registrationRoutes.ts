import { Router } from 'express';
import {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
} from '../controllers/registrationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(protect);

router.post('/', createRegistration);
router.get('/', getRegistrations);
router.get('/:id', getRegistrationById);
router.put('/:id', updateRegistration);
router.delete('/:id', authorizeRoles('PLATFORM_ADMIN'), deleteRegistration);

export default router;
