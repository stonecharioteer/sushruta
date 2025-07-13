import { Router } from 'express';
import { FamilyMemberController } from '@/controllers/FamilyMemberController';
import { validateRequest } from '@/middleware/validation';
import { 
  createFamilyMemberSchema, 
  updateFamilyMemberSchema, 
  getFamilyMemberSchema 
} from '@/utils/validationSchemas';

const router = Router();
const familyMemberController = new FamilyMemberController();

router.post(
  '/',
  validateRequest(createFamilyMemberSchema),
  familyMemberController.create
);

router.get(
  '/',
  familyMemberController.getAll
);

router.get(
  '/:id',
  validateRequest(getFamilyMemberSchema),
  familyMemberController.getById
);

router.put(
  '/:id',
  validateRequest(updateFamilyMemberSchema),
  familyMemberController.update
);

router.delete(
  '/:id',
  validateRequest(getFamilyMemberSchema),
  familyMemberController.delete
);

export { router as familyMemberRoutes };