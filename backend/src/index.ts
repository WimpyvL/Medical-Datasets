import { env } from './config/env.js';
import { initializeDatabase } from './config/database.js';
import { createApp } from './app.js';
import { initializePatientModule } from './modules/patients/index.js';

async function bootstrap() {
  await initializeDatabase();
  await initializePatientModule();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`🚀 API server listening on port ${env.port}`);
  });
}

void bootstrap();
