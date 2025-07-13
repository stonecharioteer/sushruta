import { Router } from 'express';
import { HealthController } from '@/controllers/HealthController';

const router = Router();
const healthController = new HealthController();

router.get('/health', healthController.healthCheck);
router.get('/ready', healthController.readiness);
router.get('/live', healthController.liveness);

export { router as healthRoutes };