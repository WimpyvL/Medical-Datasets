import { useCallback, useEffect, useState } from 'react';
import { DatasetSourceRecord, DatasetSnapshotSummary } from '../../types';
import { fetchDatasetSources, fetchDatasetSnapshotMetadata } from '../../services/medicalDataService';
import { ApiError } from '../../services/apiClient';
import { formatApiError } from './useSnapshotFetcher';

interface UseDatasetSourcesResult {
  datasets: DatasetSourceRecord[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshSnapshot: (source: string) => Promise<DatasetSnapshotSummary | null>;
}

const updateDatasetSnapshot = (
  datasets: DatasetSourceRecord[],
  sourceName: string,
  snapshot: DatasetSnapshotSummary | null,
): DatasetSourceRecord[] =>
  datasets.map((dataset) =>
    dataset.source.toLowerCase() === sourceName.toLowerCase()
      ? { ...dataset, latestSnapshot: snapshot }
      : dataset,
  );

export const useDatasetSources = (): UseDatasetSourcesResult => {
  const [datasets, setDatasets] = useState<DatasetSourceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDatasets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchDatasetSources();
      setDatasets(response);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDatasets();
  }, [loadDatasets]);

  const refreshSnapshot = useCallback(
    async (source: string) => {
      try {
        const snapshot = await fetchDatasetSnapshotMetadata(source);
        setDatasets((current) => updateDatasetSnapshot(current, source, snapshot));
        return snapshot;
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setDatasets((current) => updateDatasetSnapshot(current, source, null));
          return null;
        }

        setError(formatApiError(err));
        throw err;
      }
    },
  );

  const refresh = useCallback(async () => {
    await loadDatasets();
  }, [loadDatasets]);

  return {
    datasets,
    isLoading,
    error,
    refresh,
    refreshSnapshot,
  };
};

