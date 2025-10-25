import { z } from 'zod';

export const patientCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(20).optional()
});

export type PatientCreateInput = z.infer<typeof patientCreateSchema>;

export const patientResponseSchema = patientCreateSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string()
});

export type PatientResponse = z.infer<typeof patientResponseSchema>;
