import { useCallback, useState } from 'react';
import { SnapshotResponse } from '../../types';
import { ApiError } from '../../services/apiClient';

type SnapshotFetcher<T> = (pageToken?: string) => Promise<SnapshotResponse<T>>;

interface UseSnapshotFetcherResult<T> {
  snapshot: SnapshotResponse<T> | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetchLatest: () => void;
  loadPage: (token: string) => void;
  reset: () => void;
}

const formatErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred while fetching data.';
};

export const useSnapshotFetcher = <T,>(fetcher: SnapshotFetcher<T>): UseSnapshotFetcherResult<T> => {
  const [snapshot, setSnapshot] = useState<SnapshotResponse<T> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (pageToken?: string) => {
      setIsLoading(true);
      setIsRefreshing(Boolean(snapshot));
      setError(null);

      try {
        const response = await fetcher(pageToken);
        setSnapshot(response);
      } catch (err) {
        setError(formatErrorMessage(err));
      } finally {
        setIsRefreshing(false);
        setIsLoading(false);
      }
    },
    [fetcher, snapshot],
  );

  const fetchLatest = useCallback(() => {
    void loadData();
  }, [loadData]);

  const loadPage = useCallback(
    (token: string) => {
      void loadData(token);
    },
    [loadData],
  );

  const reset = useCallback(() => {
    setSnapshot(null);
    setIsRefreshing(false);
    setError(null);
  }, []);

  return {
    snapshot,
    isLoading,
    isRefreshing,
    error,
    fetchLatest,
    loadPage,
    reset,
  };
};

