import { Router } from 'express';
import { getPatients, postPatient } from './patient.controller.js';

export const patientRouter = Router();

patientRouter.get('/', getPatients);
patientRouter.post('/', postPatient);
