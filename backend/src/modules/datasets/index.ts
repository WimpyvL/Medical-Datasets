import type { Router } from 'express';
import cron from 'node-cron';
import { datasetRouter } from './dataset.routes.js';
import { datasetConfig } from './dataset.config.js';
import { ingestDatasetSource, initializeDatasets, resolveDatasetSource } from './dataset.service.js';
import { DatasetSource } from './dataset.types.js';

let scheduledTask: cron.ScheduledTask | null = null;

function startScheduler(): void {
  if (datasetConfig.scheduledSources.length === 0) {
    return;
  }

  const resolvedSources = datasetConfig.scheduledSources.map((source) => {
    try {
      return resolveDatasetSource(source);
    } catch (error) {
      console.warn(`[datasets] Unable to schedule source ${source}: ${(error as Error).message}`);
      return null;
    }
  }).filter((value): value is DatasetSource => value !== null);

  if (resolvedSources.length === 0) {
    return;
  }

  scheduledTask = cron.schedule(datasetConfig.cronExpression, async () => {
    for (const source of resolvedSources) {
      try {
        await ingestDatasetSource(source);
      } catch (error) {
        console.error(`[datasets] Scheduled ingestion failed for ${source}:`, error);
      }
    }
  });

  scheduledTask.start();
  console.log(`[datasets] Scheduler started for ${resolvedSources.join(', ')} using cron ${datasetConfig.cronExpression}`);
}

export async function initializeDatasetModule(): Promise<void> {
  await initializeDatasets();
  startScheduler();
}

export function registerDatasetModule(router: Router): void {
  router.use('/datasets', datasetRouter);
}

export function stopDatasetScheduler(): void {
  scheduledTask?.stop();
  scheduledTask = null;
}
