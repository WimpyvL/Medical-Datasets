import type { Request, Response } from 'express';
import { HttpError } from '../../utils/http-error.js';
import {
  ingestDatasetSource,
  latestSnapshotForSource,
  listSources,
  resolveDatasetSource
} from './dataset.service.js';

export async function postIngestDataset(req: Request, res: Response) {
  const { source } = req.params;
  if (!source) {
    throw new HttpError(400, 'Source parameter is required');
  }
  const snapshot = await ingestDatasetSource(source);
  res.status(202).json(snapshot);
}

export async function getDatasetSources(_req: Request, res: Response) {
  const sources = await listSources();
  res.json(sources);
}

export async function getLatestSnapshot(req: Request, res: Response) {
  const { source } = req.params;
  if (!source) {
    throw new HttpError(400, 'Source parameter is required');
  }
  const datasetSource = resolveDatasetSource(source);
  const snapshot = await latestSnapshotForSource(datasetSource);
  if (!snapshot) {
    res.status(404).json({ message: `No snapshots recorded for ${datasetSource}` });
    return;
  }
  res.json(snapshot);
}
