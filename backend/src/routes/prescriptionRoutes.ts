import { Router } from 'express';
import { PrescriptionController } from '../controllers/PrescriptionController';
import { validateRequest } from '../middleware/validation';
import { 
  createPrescriptionSchema, 
  updatePrescriptionSchema, 
  getFamilyMemberSchema 
} from '../utils/validationSchemas';

const router = Router();
const prescriptionController = new PrescriptionController();

router.post(
  '/',
  validateRequest(createPrescriptionSchema),
  prescriptionController.create
);

router.get(
  '/',
  prescriptionController.getAll
);

router.get(
  '/:id',
  validateRequest(getFamilyMemberSchema),
  prescriptionController.getById
);

router.put(
  '/:id',
  validateRequest(updatePrescriptionSchema),
  prescriptionController.update
);

router.patch(
  '/:id/deactivate',
  validateRequest(getFamilyMemberSchema),
  prescriptionController.deactivate
);

router.delete(
  '/:id',
  validateRequest(getFamilyMemberSchema),
  prescriptionController.delete
);

export { router as prescriptionRoutes };