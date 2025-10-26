import React from 'react';
import { SnapshotResponse } from '../types';

interface DataDisplayProps<T> {
  snapshot: SnapshotResponse<T> | null;
  error: string | null;
  isLoading: boolean;
  isRefreshing?: boolean;
  onFetchLatest: () => void;
  renderData: (data: T[]) => React.ReactNode;
  onLoadPage?: (token: string) => void;
  onDownload?: () => void;
}

const DataDisplay = <T,>({
  snapshot,
  error,
  isLoading,
  isRefreshing = false,
  onFetchLatest,
  renderData,
  onLoadPage,
  onDownload,
}: DataDisplayProps<T>) => {
  const metadata = snapshot?.snapshot;
  const pagination = snapshot?.pagination;
  const items = snapshot?.items ?? [];
  const hasData = items.length > 0;
  const isCachedSnapshot = Boolean(metadata?.isFromCache);
  const showEmptyState = !error && !hasData && !isLoading;
  const showLoadingState = isLoading && !hasData;
  const showPagination = Boolean(onLoadPage && (pagination?.previousToken || pagination?.nextToken));
  const disableFetchButton = showLoadingState || (isRefreshing && isCachedSnapshot);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 min-h-[300px] flex flex-col">
      <div className="flex-grow relative">
        {isRefreshing && hasData && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-white/80">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
            <p className="text-sm font-medium text-cyan-700">Fetching latest snapshot…</p>
          </div>
        )}
        {showLoadingState && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
            <p className="text-sm text-slate-600">Retrieving snapshot data. Large datasets may take a moment.</p>
          </div>
        )}
        {error && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-red-500">{error}</p>
            {isCachedSnapshot && (
              <p className="mt-2 text-sm text-slate-500">Showing cached snapshot until a new request succeeds.</p>
            )}
          </div>
        )}
        {snapshot && metadata && (
          <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div>
                <span className="font-semibold text-slate-700">Snapshot Timestamp:</span> {metadata.timestamp}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Source:</span> {metadata.source}
              </div>
              {typeof metadata.recordCount === 'number' && (
                <div>
                  <span className="font-semibold text-slate-700">Records:</span> {metadata.recordCount.toLocaleString()}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Cache Status:</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isCachedSnapshot ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isCachedSnapshot ? 'Served from cache' : 'Fresh snapshot'}
                </span>
              </div>
            </div>
            {isCachedSnapshot && !isLoading && (
              <p className="mt-3 text-xs text-slate-500">
                Cached data is shown while the system prepares the latest snapshot.
              </p>
            )}
          </div>
        )}
        {hasData && (
          <div className="relative">
            {renderData(items)}
          </div>
        )}
        {showEmptyState && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h3 className="text-lg font-medium text-slate-700">No Snapshot Loaded</h3>
            <p className="text-slate-500 mt-1">Request the latest backend snapshot to view records and pagination metadata.</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button
          onClick={onFetchLatest}
          disabled={disableFetchButton}
          className="px-6 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Fetching...' : 'Fetch Latest Snapshot'}
        </button>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {showPagination && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => pagination?.previousToken && onLoadPage?.(pagination.previousToken)}
                disabled={!pagination?.previousToken}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous Page
              </button>
              <button
                onClick={() => pagination?.nextToken && onLoadPage?.(pagination.nextToken)}
                disabled={!pagination?.nextToken}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-white font-semibold shadow transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Next Page
              </button>
            </div>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="px-4 py-2 rounded-lg border border-cyan-500 text-cyan-600 font-semibold hover:bg-cyan-50 transition-colors"
            >
              Download Snapshot
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataDisplay;
