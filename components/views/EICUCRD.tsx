
import React, { useCallback } from 'react';
import { EicuCrdData } from '../../types';
import { fetchEicuCrdData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const EICUCRD: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchEicuCrdData(pageToken), []);
  const { snapshot, isLoading, isRefreshing, error, fetchLatest, loadPage } = useSnapshotFetcher<EicuCrdData>(fetcher);
  const downloadUrl = snapshot?.downloadUrl;
  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  }, [downloadUrl]);

  const renderCards = (d: EicuCrdData[]) => (
    <div className="space-y-4">
      {d.map((item) => (
        <div key={item.table_name} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-md text-slate-800">{item.table_name}</h3>
          <p className="text-xs text-slate-500 mb-2">Admissions: ~{item.row_count}</p>
          <p className="text-sm text-slate-700">{item.description}</p>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="eICU Collaborative Research Database"
      description="A multi-center ICU database with high-granularity data for over 200,000 admissions in the United States."
      sourceUrl="https://physionet.org/content/eicu-crd/2.0/"
      ingestion={
        <>
          <h4 className="font-semibold text-slate-800 text-base mb-2">Access & Cost</h4>
          <p className="mb-2"><strong>Cost:</strong> Free of charge.</p>
          <p className="mb-2"><strong>Requirements:</strong> Same as MIMIC-IV, requiring PhysioNet credentialing (ethics training and a signed DUA).</p>
          
          <h4 className="font-semibold text-slate-800 text-base mt-4 mb-2">Data Value & Use Cases</h4>
          <ul className="list-disc list-inside space-y-1">
              <li><strong>Multi-Center Perspective:</strong> Data from over 200 hospitals across the U.S., allowing for more generalizable models than single-center datasets.</li>
              <li><strong>Extreme Granularity:</strong> Contains over 2.7 billion rows of vital signs, captured as frequently as every 5 minutes.</li>
              <li><strong>Generalizability Testing:</strong> Excellent for validating models trained on other datasets (like MIMIC-IV) to see how they perform across different hospital systems.</li>
          </ul>
        </>
      }
    >
      <DataDisplay<EicuCrdData>
        snapshot={snapshot}
        error={error}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onFetchLatest={fetchLatest}
        onLoadPage={loadPage}
        onDownload={downloadUrl ? handleDownload : undefined}
        renderData={renderCards}
      />
    </DataSourceCard>
  );
};

export default EICUCRD;
