import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { dirname, join } from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import { HttpError } from '../../utils/http-error.js';
import { DatasetConnectorOutput, DatasetIngestionContext, DatasetLogger, DatasetSnapshotRecord, DatasetSource } from './dataset.types.js';
import { datasetConfig } from './dataset.config.js';
import { createDatasetConnectors } from './connectors/sources.js';
import { ensureDatasetTables, getLatestSnapshot, getSourceRow, insertSnapshot, listDatasetSources, updateSnapshot } from './dataset.repository.js';

class ConsoleLogger implements DatasetLogger {
  info(message: string, meta?: Record<string, unknown>): void {
    console.log(`[datasets] ${message}`, meta ?? '');
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[datasets] ${message}`, meta ?? '');
  }

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(`[datasets] ${message}`, meta ?? '');
  }
}

const connectors = createDatasetConnectors();
const logger = new ConsoleLogger();

export function resolveDatasetSource(value: string): DatasetSource {
  const match = (Object.values(DatasetSource) as string[]).find((item) => item.toLowerCase() === value.toLowerCase());
  if (!match) {
    throw new HttpError(404, `Unknown dataset source: ${value}`);
  }
  return match as DatasetSource;
}

function sanitizeSourceForPath(source: DatasetSource): string {
  return source.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function writeStreamToFile(
  output: DatasetConnectorOutput,
  destination: string
): Promise<{ checksum: string; itemCount?: number }> {
  await mkdir(dirname(destination), { recursive: true });
  const hash = createHash('sha256');
  let runningCount: number | undefined;
  let remainder = '';

  const hashingStream = new Transform({
    transform(chunk, encoding, callback) {
      const buffer = typeof chunk === 'string' ? Buffer.from(chunk, encoding as BufferEncoding) : (chunk as Buffer);
      hash.update(buffer);

      if (output.fileExtension === '.jsonl') {
        const text = remainder + buffer.toString('utf8');
        const parts = text.split('\n');
        remainder = parts.pop() ?? '';
        const nonEmpty = parts.filter((line) => line.trim().length > 0).length;
        if (nonEmpty > 0) {
          runningCount = (runningCount ?? 0) + nonEmpty;
        }
      }

      callback(null, buffer);
    },
    flush(callback) {
      if (output.fileExtension === '.jsonl' && remainder.trim().length > 0) {
        runningCount = (runningCount ?? 0) + 1;
      }
      callback();
    }
  });

  await pipeline(output.stream, hashingStream, createWriteStream(destination));
  return { checksum: hash.digest('hex'), itemCount: runningCount };
}

export async function initializeDatasets(): Promise<void> {
  await ensureDatasetTables();
}

export async function listSources() {
  return listDatasetSources();
}

export async function latestSnapshotForSource(source: DatasetSource): Promise<DatasetSnapshotRecord | null> {
  return getLatestSnapshot(source);
}

export async function ingestDatasetSource(sourceValue: string): Promise<DatasetSnapshotRecord | null> {
  const source = resolveDatasetSource(sourceValue);
  const connector = connectors.get(source);
  if (!connector) {
    throw new HttpError(404, `No connector registered for source ${source}`);
  }

  const sourceRow = await getSourceRow(source);
  if (!sourceRow) {
    throw new HttpError(404, `Source ${source} not registered in database`);
  }

  const slug = sanitizeSourceForPath(source);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const storageDir = join(datasetConfig.storageDir, slug);
  await mkdir(storageDir, { recursive: true });

  let attempt = 0;
  const maxAttempts = datasetConfig.maxRetries;
  let lastError: unknown;
  let snapshotId: string | null = null;
  let finalPath = '';

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const context: DatasetIngestionContext = {
        storageDir: datasetConfig.storageDir,
        tempDir: datasetConfig.tempDir,
        logger
      };

      const output = await connector.prepare(context);
      const targetFile = join(storageDir, `${slug}-${timestamp}${output.fileExtension}`);
      finalPath = targetFile;
      snapshotId = snapshotId ?? (await insertSnapshot({ sourceId: sourceRow.id, status: 'pending', storageLocation: targetFile }));

      const { checksum, itemCount } = await writeStreamToFile(output, targetFile);
      const metadata = {
        ...(output.metadata ?? {}),
        contentType: output.contentType,
        itemCount: output.itemCount ?? itemCount
      };
      await updateSnapshot(snapshotId, { status: 'completed', checksum, metadata, storageLocation: targetFile });
      return getLatestSnapshot(source);
    } catch (error) {
      lastError = error;
      logger.error('Ingestion attempt failed', { source, attempt, error: (error as Error).message });
      if (attempt < maxAttempts) {
        await sleep(datasetConfig.retryBackoffMs);
        continue;
      }
    }
  }

  if (snapshotId) {
    await updateSnapshot(snapshotId, {
      status: 'failed',
      checksum: null,
      metadata: finalPath ? { storageLocation: finalPath } : undefined,
      error: lastError instanceof Error ? lastError.message : 'Unknown error',
      storageLocation: finalPath || undefined
    });
  } else {
    const placeholder = join(storageDir, `${slug}-${timestamp}.failed`);
    const failureId = await insertSnapshot({ sourceId: sourceRow.id, status: 'failed', storageLocation: placeholder });
    await updateSnapshot(failureId, {
      status: 'failed',
      checksum: null,
      metadata: { storageLocation: placeholder },
      error: lastError instanceof Error ? lastError.message : 'Unknown error',
      storageLocation: placeholder
    });
  }

  throw new HttpError(500, lastError instanceof Error ? lastError.message : 'Failed to ingest dataset');
}

export const datasetSources = connectors;
