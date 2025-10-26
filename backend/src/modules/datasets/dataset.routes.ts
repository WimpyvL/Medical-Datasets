import { Router } from 'express';
import { getDatasetSources, getLatestSnapshot, postIngestDataset } from './dataset.controller.js';

export const datasetRouter = Router();

datasetRouter.get('/', getDatasetSources);
datasetRouter.get('/:source/latest', getLatestSnapshot);
datasetRouter.post('/:source/ingest', postIngestDataset);
