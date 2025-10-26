
import React, { useCallback } from 'react';
import { Luna16Sample } from '../../types';
import { fetchLuna16Data } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const LUNA16: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchLuna16Data(pageToken), []);
  const { data, isLoading, error, fetchData, fetchPage } = useSnapshotFetcher<Luna16Sample>(fetcher);

  const renderCards = (d: Luna16Sample[]) => (
    <div className="space-y-4">
      {d.map((item) => (
        <div key={item.series_uid} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-md text-slate-800 truncate">Series UID: {item.series_uid}</h3>
          <p className="text-sm text-slate-700 mt-2">{item.description}</p>
          <div className="mt-2">
             <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-green-100 text-green-800">Nodules: {item.nodule_count}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="LUNA16 Challenge Dataset"
      description="The Lung Nodule Analysis 2016 challenge dataset, focused on lung nodule detection in CT scans. A foundational dataset for medical imaging AI."
      sourceUrl="https://luna16.grand-challenge.org/Download/"
      ingestion={
        <>
          <p><strong>Method:</strong> Academic Challenge Portal</p>
          <p>The download link is often buried within academic challenge websites like Grand Challenge, requiring navigation to find the specific data access page.</p>
        </>
      }
    >
      <DataDisplay<Luna16Sample>
        data={data}
        error={error}
        isLoading={isLoading}
        fetchData={fetchData}
        fetchPage={fetchPage}
        renderData={renderCards}
      />
    </DataSourceCard>
  );
};

export default LUNA16;
