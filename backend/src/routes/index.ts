import { Router } from 'express';
import { healthRouter } from '../modules/health/health.routes.js';
import { registerPatientModule } from '../modules/patients/index.js';

export function createApiRouter(): Router {
  const router = Router();

  router.use('/health', healthRouter);
  registerPatientModule(router);

  return router;
}
