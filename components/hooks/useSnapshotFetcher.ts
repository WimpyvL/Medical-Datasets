import { useCallback, useState } from 'react';
import { SnapshotResponse } from '../../types';
import { ApiError } from '../../services/apiClient';

type SnapshotFetcher<T> = (pageToken?: string) => Promise<SnapshotResponse<T>>;

interface UseSnapshotFetcherResult<T> {
  data: SnapshotResponse<T> | null;
  isLoading: boolean;
  error: string | null;
  fetchData: () => void;
  fetchPage: (token: string) => void;
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
  const [data, setData] = useState<SnapshotResponse<T> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (pageToken?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetcher(pageToken);
        setData(response);
      } catch (err) {
        setError(formatErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [fetcher],
  );

  const fetchData = useCallback(() => {
    void loadData();
  }, [loadData]);

  const fetchPage = useCallback(
    (token: string) => {
      void loadData(token);
    },
    [loadData],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    fetchData,
    fetchPage,
    reset,
  };
};

