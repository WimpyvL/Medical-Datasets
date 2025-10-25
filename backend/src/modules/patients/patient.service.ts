import { randomUUID } from 'node:crypto';
import type { QueryResult } from 'pg';
import { pool } from '../../config/database.js';
import { HttpError } from '../../utils/http-error.js';
import type { PatientCreateInput, PatientResponse } from './patient.schema.js';

function mapRow(row: QueryResult['rows'][number]): PatientResponse {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    createdAt: row.created_at
  };
}

export async function ensurePatientsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id UUID PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth DATE NOT NULL,
      email TEXT,
      phone TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function listPatients(): Promise<PatientResponse[]> {
  const result = await pool.query('SELECT * FROM patients ORDER BY created_at DESC');
  return result.rows.map(mapRow);
}

export async function createPatient(payload: PatientCreateInput): Promise<PatientResponse> {
  const id = randomUUID();

  const result = await pool.query(
    `
      INSERT INTO patients (id, first_name, last_name, date_of_birth, email, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [id, payload.firstName, payload.lastName, payload.dateOfBirth, payload.email ?? null, payload.phone ?? null]
  );

  if (result.rowCount !== 1) {
    throw new HttpError(500, 'Unable to create patient');
  }

  return mapRow(result.rows[0]);
}
