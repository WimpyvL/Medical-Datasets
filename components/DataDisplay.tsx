import React from 'react';
import { SnapshotResponse } from '../types';

interface DataDisplayProps<T> {
  data: SnapshotResponse<T> | null;
  error: string | null;
  isLoading: boolean;
  fetchData: () => void;
  renderData: (data: T[]) => React.ReactNode;
  fetchPage?: (token: string) => void;
}

const DataDisplay = <T,>({ data, error, isLoading, fetchData, renderData, fetchPage }: DataDisplayProps<T>) => {
  const metadata = data?.snapshot;
  const pagination = data?.pagination;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 min-h-[300px] flex flex-col">
      <div className="flex-grow">
        {data && metadata && (
          <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div>
                <span className="font-semibold text-slate-700">Source:</span> {metadata.source}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Snapshot:</span> {metadata.timestamp}
              </div>
              {typeof metadata.recordCount === 'number' && (
                <div>
                  <span className="font-semibold text-slate-700">Records:</span> {metadata.recordCount.toLocaleString()}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Cache:</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    metadata.isFromCache ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {metadata.isFromCache ? 'Served from cache' : 'Fresh snapshot'}
                </span>
              </div>
            </div>
            {data.downloadUrl && (
              <div className="mt-3">
                <a
                  href={data.downloadUrl}
                  className="text-cyan-600 hover:text-cyan-700 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download full snapshot
                </a>
              </div>
            )}
          </div>
        )}
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        {!isLoading && !error && data && data.items.length > 0 && (
          <>
            {renderData(data.items)}
            {fetchPage && (pagination?.previousToken || pagination?.nextToken) && (
              <div className="mt-6 flex justify-end gap-3">
                {pagination?.previousToken && (
                  <button
                    onClick={() => pagination.previousToken && fetchPage(pagination.previousToken)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Previous Page
                  </button>
                )}
                {pagination?.nextToken && (
                  <button
                    onClick={() => fetchPage(pagination.nextToken!)}
                    className="px-4 py-2 rounded-lg bg-cyan-500 text-white font-semibold shadow hover:bg-cyan-600 transition-colors"
                  >
                    Next Page
                  </button>
                )}
              </div>
            )}
          </>
        )}
        {!isLoading && !error && (!data || data.items.length === 0) && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h3 className="text-lg font-medium text-slate-700">No Data Fetched</h3>
            <p className="text-slate-500 mt-1">Click the button below to retrieve sample data.</p>
          </div>
        )}
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="px-6 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Fetching...' : 'Fetch Sample Data'}
        </button>
      </div>
    </div>
  );
};

export default DataDisplay;
