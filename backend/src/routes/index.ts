import { Router } from 'express';
import { familyMemberRoutes } from './familyMemberRoutes';
import { medicationRoutes } from './medicationRoutes';
import { prescriptionRoutes } from './prescriptionRoutes';
import { medicationLogRoutes } from './medicationLogRoutes';
import { healthRoutes } from './healthRoutes';

const router = Router();

// Health check routes (no /api prefix)
router.use('/', healthRoutes);

// API routes
router.use('/api/family-members', familyMemberRoutes);
router.use('/api/medications', medicationRoutes);
router.use('/api/prescriptions', prescriptionRoutes);
router.use('/api/medication-logs', medicationLogRoutes);

export { router as apiRoutes };