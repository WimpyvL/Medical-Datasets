import type { Router } from 'express';
import { patientRouter } from './patient.routes.js';
import { ensurePatientsTable } from './patient.service.js';

export function registerPatientModule(router: Router): void {
  router.use('/patients', patientRouter);
}

export async function initializePatientModule(): Promise<void> {
  await ensurePatientsTable();
}
