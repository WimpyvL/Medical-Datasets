import { DatasetSourceRecord, DatasetSnapshotSummary } from '../types';
import { apiFetch } from './apiClient';

export const fetchDatasetSources = () => apiFetch<DatasetSourceRecord[]>('/api/datasets');

export const fetchDatasetSnapshotMetadata = (source: string) =>
  apiFetch<DatasetSnapshotSummary>(`/api/datasets/${encodeURIComponent(source)}/latest`);
