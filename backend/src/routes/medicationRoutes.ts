import { Router } from 'express';
import { MedicationController } from '../controllers/MedicationController';
import { validateRequest } from '../middleware/validation';
import { 
  createMedicationSchema, 
  updateMedicationSchema, 
  getFamilyMemberSchema 
} from '../utils/validationSchemas';

const router = Router();
const medicationController = new MedicationController();

router.post(
  '/',
  validateRequest(createMedicationSchema),
  medicationController.create
);

router.get(
  '/',
  medicationController.getAll
);

router.get(
  '/:id',
  validateRequest(getFamilyMemberSchema),
  medicationController.getById
);

router.put(
  '/:id',
  validateRequest(updateMedicationSchema),
  medicationController.update
);

router.delete(
  '/:id',
  validateRequest(getFamilyMemberSchema),
  medicationController.delete
);

export { router as medicationRoutes };