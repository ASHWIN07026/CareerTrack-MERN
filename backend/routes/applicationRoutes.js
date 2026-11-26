import { Router } from 'express';
import {
  createApplication,
  deleteApplication,
  getApplication,
  getStats,
  listApplications,
  updateApplication,
} from '../controllers/applicationController.js';
import { validateCreate, validateId, validateList, validateUpdate } from '../middleware/validate.js';

const router = Router();

router.get('/stats', getStats);
router.route('/').get(validateList, listApplications).post(validateCreate, createApplication);
router
  .route('/:id')
  .get(validateId, getApplication)
  .put(validateUpdate, updateApplication)
  .delete(validateId, deleteApplication);

export default router;
