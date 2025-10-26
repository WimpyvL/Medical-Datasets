import { env } from './config/env.js';
import { initializeDatabase } from './config/database.js';
import { createApp } from './app.js';
import { initializePatientModule } from './modules/patients/index.js';
import { initializeDatasetModule } from './modules/datasets/index.js';

async function bootstrap() {
  await initializeDatabase();
  await initializePatientModule();
  await initializeDatasetModule();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`🚀 API server listening on port ${env.port}`);
  });
}

void bootstrap();
