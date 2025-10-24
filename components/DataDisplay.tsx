import React from 'react';

interface DataDisplayProps<T> {
  data: T[] | null;
  error: string | null;
  isLoading: boolean;
  fetchData: () => void;
  renderData: (data: T[]) => React.ReactNode;
}

const DataDisplay = <T,>({ data, error, isLoading, fetchData, renderData }: DataDisplayProps<T>) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 min-h-[300px] flex flex-col">
      <div className="flex-grow">
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
        {!isLoading && !error && data && data.length > 0 && (
          renderData(data)
        )}
        {!isLoading && !error && (!data || data.length === 0) && (
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