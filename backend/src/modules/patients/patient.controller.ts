import type { Request, Response } from 'express';
import { patientCreateSchema } from './patient.schema.js';
import { createPatient, listPatients } from './patient.service.js';

export async function getPatients(_req: Request, res: Response): Promise<Response> {
  const patients = await listPatients();
  return res.json({ data: patients });
}

export async function postPatient(req: Request, res: Response): Promise<Response> {
  const parsed = patientCreateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payload',
      issues: parsed.error.flatten()
    });
  }

  const patient = await createPatient(parsed.data);
  return res.status(201).json({ data: patient });
}
