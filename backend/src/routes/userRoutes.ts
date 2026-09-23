import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', authorizeRoles('PLATFORM_ADMIN'), getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', authorizeRoles('PLATFORM_ADMIN'), deleteUser);

export default router;
