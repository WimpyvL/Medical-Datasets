import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce
    .number()
    .int()
    .positive('PORT must be a positive integer')
    .default(4000),
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z
    .string()
    .optional()
    .transform((value) => (value ? Number.parseInt(value, 10) : undefined)),
  DATABASE_POOL_MAX: z
    .string()
    .optional()
    .transform((value) => (value ? Number.parseInt(value, 10) : undefined))
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  databaseUrl: parsedEnv.data.DATABASE_URL,
  pool: {
    min: parsedEnv.data.DATABASE_POOL_MIN ?? 0,
    max: parsedEnv.data.DATABASE_POOL_MAX ?? 10
  }
};
