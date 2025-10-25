import { Pool } from 'pg';
import { env } from './env.js';

export const pool = new Pool({
  connectionString: env.databaseUrl,
  min: env.pool.min,
  max: env.pool.max,
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined
});

export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('✅ Database connection established');
  } finally {
    client.release();
  }
}
