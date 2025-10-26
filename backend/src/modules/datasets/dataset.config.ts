import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { env } from '../../config/env.js';

const datasetEnvSchema = z.object({
  storageDir: z.string().default(join(process.cwd(), 'storage', 'datasets')),
  tempDir: z.string().default(join(process.cwd(), 'storage', 'tmp')),
  maxRetries: z.number().int().min(1).max(10).default(3),
  retryBackoffMs: z.number().int().positive().default(5000),
  cronExpression: z.string().default('0 3 * * *'),
  scheduledSources: z.array(z.string()).default([])
});

const parsed = datasetEnvSchema.parse({
  storageDir: process.env.DATASET_STORAGE_DIR,
  tempDir: process.env.DATASET_TEMP_DIR,
  maxRetries: process.env.DATASET_MAX_RETRIES ? Number.parseInt(process.env.DATASET_MAX_RETRIES, 10) : undefined,
  retryBackoffMs: process.env.DATASET_RETRY_BACKOFF_MS ? Number.parseInt(process.env.DATASET_RETRY_BACKOFF_MS, 10) : undefined,
  cronExpression: process.env.DATASET_CRON_EXPRESSION,
  scheduledSources: process.env.DATASET_SCHEDULED_SOURCES
    ? process.env.DATASET_SCHEDULED_SOURCES.split(',').map((value) => value.trim()).filter(Boolean)
    : undefined
});

mkdirSync(parsed.storageDir, { recursive: true });
mkdirSync(parsed.tempDir, { recursive: true });

export const datasetConfig = {
  storageDir: parsed.storageDir,
  tempDir: parsed.tempDir,
  maxRetries: parsed.maxRetries,
  retryBackoffMs: parsed.retryBackoffMs,
  cronExpression: parsed.cronExpression,
  scheduledSources: parsed.scheduledSources,
  getSourceBaseUrl(sourceKey: string, fallback: string): string {
    const envKey = `DATASET_${sourceKey.toUpperCase()}_BASE_URL`;
    const value = process.env[envKey];
    return value ?? fallback;
  },
  getSourceDownloadUrl(sourceKey: string, fallback: string): string {
    const envKey = `DATASET_${sourceKey.toUpperCase()}_DOWNLOAD_URL`;
    const value = process.env[envKey];
    return value ?? fallback;
  },
  getSourceApiKey(sourceKey: string): string | undefined {
    return process.env[`DATASET_${sourceKey.toUpperCase()}_API_KEY`];
  }
};

export { env };
