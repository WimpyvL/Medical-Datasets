import { Router } from 'express';
import { healthRouter } from '../modules/health/health.routes.js';
import { registerPatientModule } from '../modules/patients/index.js';
import { registerDatasetModule } from '../modules/datasets/index.js';
import { firescrapeRouter } from '../modules/firescrape/firescrape.routes.js';
import { firecrawlRouter } from '../modules/firecrawl/firecrawl.routes.js';

export function createApiRouter(): Router {
  const router = Router();

  router.use('/health', healthRouter);
  router.use('/firescrape', firescrapeRouter);
  router.use('/firecrawl', firecrawlRouter);
  registerPatientModule(router);
  registerDatasetModule(router);

  return router;
}
