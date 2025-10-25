import { Router } from 'express';
import { healthRouter } from '../modules/health/health.routes.js';
import { registerPatientModule } from '../modules/patients/index.js';
import { firescrapeRouter } from '../modules/firescrape/firescrape.routes.js';

export function createApiRouter(): Router {
  const router = Router();

  router.use('/health', healthRouter);
  router.use('/firescrape', firescrapeRouter);
  registerPatientModule(router);

  return router;
}
