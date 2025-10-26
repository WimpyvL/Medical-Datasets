import React, { useCallback, useMemo, useState } from 'react';
import DataSourceCard from '../DataSourceCard';
import { DatasetSourceRecord } from '../../types';
import { formatApiError } from '../hooks/useSnapshotFetcher';

interface DatasetSnapshotViewProps {
  dataset: DatasetSourceRecord;
  onRefreshSnapshot: (source: string) => Promise<unknown>;
}

const formatDateTime = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const getStatusStyles = (status: string): string => {
  const normalized = status.toLowerCase();
  if (['completed', 'success', 'succeeded'].includes(normalized)) {
    return 'bg-emerald-100 text-emerald-800';
  }
  if (['running', 'in_progress', 'processing', 'pending', 'queued'].includes(normalized)) {
    return 'bg-blue-100 text-blue-700';
  }
  if (['failed', 'error'].includes(normalized)) {
    return 'bg-rose-100 text-rose-700';
  }
  return 'bg-slate-100 text-slate-600';
};

const DatasetSnapshotView: React.FC<DatasetSnapshotViewProps> = ({ dataset, onRefreshSnapshot }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const snapshot = dataset.latestSnapshot;
  const description = dataset.description ??
    'This page was generated automatically from the datasets module. Trigger a new ingestion to capture the latest data.';

  const createdAt = useMemo(() => formatDateTime(dataset.createdAt), [dataset.createdAt]);
  const completedAt = useMemo(() => formatDateTime(snapshot?.completedAt ?? snapshot?.createdAt), [snapshot?.completedAt, snapshot?.createdAt]);

  const handleRefresh = useCallback(async () => {
    setLocalError(null);
    setIsRefreshing(true);
    try {
      await onRefreshSnapshot(dataset.source);
    } catch (error) {
      setLocalError(formatApiError(error));
    } finally {
      setIsRefreshing(false);
    }
  }, [dataset.source, onRefreshSnapshot]);

  return (
    <DataSourceCard
      title={dataset.source}
      description={description}
      ingestion={
        <div className="space-y-2 text-sm">
          <p>
            <strong className="font-semibold text-slate-700">Source registered:</strong>{' '}
            <span className="text-slate-600">{createdAt ?? dataset.createdAt}</span>
          </p>
          <p className="text-slate-600">
            The ingestion service records every snapshot in PostgreSQL and stores artifacts on disk. Use the controls below to
            view the most recent metadata captured for this dataset source.
          </p>
        </div>
      }
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Latest Snapshot</h2>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center rounded-lg border border-cyan-500 px-4 py-2 text-sm font-semibold text-cyan-600 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh Snapshot'}
          </button>
        </div>

        {localError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-semibold">Unable to refresh snapshot</p>
            <p className="mt-1">{localError}</p>
          </div>
        )}

        {snapshot ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-700">Status</p>
                <span className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(snapshot.status)}`}>
                  {snapshot.status}
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-700">Snapshot Captured</p>
                <p className="mt-2 text-sm text-slate-600">{completedAt ?? 'Unknown'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-700">Storage Location</p>
                <p className="mt-2 text-xs font-mono text-slate-600 break-all">{snapshot.storageLocation}</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-700">Checksum</p>
                <p className="mt-2 text-xs font-mono text-slate-600 break-all">{snapshot.checksum ?? 'Not available'}</p>
              </div>
            </div>

            {snapshot.error && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                <p className="font-semibold">Reported error</p>
                <p className="mt-1">{snapshot.error}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Metadata</h3>
              <div className="max-h-80 overflow-y-auto rounded-lg bg-slate-900 text-slate-100 p-4 text-sm">
                <pre className="whitespace-pre-wrap">{JSON.stringify(snapshot.metadata ?? {}, null, 2)}</pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
            <p className="font-medium text-slate-700">No snapshots recorded yet.</p>
            <p className="mt-2 text-sm">
              Start an ingestion job from the sidebar to generate the first snapshot for this dataset.
            </p>
          </div>
        )}
      </div>
    </DataSourceCard>
  );
};

export default DatasetSnapshotView;
