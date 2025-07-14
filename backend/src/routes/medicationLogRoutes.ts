import { Router } from 'express';
import { MedicationLogController } from '../controllers/MedicationLogController';
import { validateRequest } from '../middleware/validation';
import { 
  createMedicationLogSchema, 
  updateMedicationLogSchema, 
  getFamilyMemberSchema 
} from '../utils/validationSchemas';

const router = Router();
const medicationLogController = new MedicationLogController();

router.post(
  '/',
  validateRequest(createMedicationLogSchema),
  medicationLogController.create
);

router.get(
  '/',
  medicationLogController.getAll
);

router.get(
  '/today',
  medicationLogController.getTodaysSchedule
);

router.get(
  '/schedule/:date',
  medicationLogController.getScheduleForDate
);

router.get(
  '/compliance-stats',
  medicationLogController.getComplianceStats
);

router.get(
  '/:id',
  validateRequest(getFamilyMemberSchema),
  medicationLogController.getById
);

router.put(
  '/:id',
  validateRequest(updateMedicationLogSchema),
  medicationLogController.update
);

router.patch(
  '/:id/taken',
  validateRequest(getFamilyMemberSchema),
  medicationLogController.markAsTaken
);

router.patch(
  '/:id/missed',
  validateRequest(getFamilyMemberSchema),
  medicationLogController.markAsMissed
);

router.patch(
  '/:id/skipped',
  validateRequest(getFamilyMemberSchema),
  medicationLogController.markAsSkipped
);

router.delete(
  '/:id',
  validateRequest(getFamilyMemberSchema),
  medicationLogController.delete
);

export { router as medicationLogRoutes };