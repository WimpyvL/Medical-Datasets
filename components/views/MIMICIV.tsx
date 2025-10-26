
import React, { useCallback } from 'react';
import { MimicIvData } from '../../types';
import { fetchMimicIvData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const MIMICIV: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchMimicIvData(pageToken), []);
  const { snapshot, isLoading, isRefreshing, error, fetchLatest, loadPage } = useSnapshotFetcher<MimicIvData>(fetcher);
  const downloadUrl = snapshot?.downloadUrl;
  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  }, [downloadUrl]);

  const renderCards = (d: MimicIvData[]) => (
    <div className="space-y-4">
      {d.map((item) => (
        <div key={item.table_name} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-md text-slate-800">{item.table_name}</h3>
          <p className="text-xs text-slate-500 mb-2">Rows: ~{item.row_count}</p>
          <p className="text-sm text-slate-700">{item.description}</p>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="MIMIC-IV Database"
      description="A large, freely-accessible database containing de-identified health data from the Beth Israel Deaconess Medical Center."
      sourceUrl="https://physionet.org/content/mimiciv/2.2/"
      ingestion={
        <>
          <h4 className="font-semibold text-slate-800 text-base mb-2">Access & Cost</h4>
          <p className="mb-2"><strong>Cost:</strong> Free of charge.</p>
          <p className="mb-2"><strong>Requirements:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Completion of ethics training (e.g., CITI Program "Data or Specimens Only Research").</li>
            <li>Registration on the PhysioNet platform.</li>
            <li>Signing a Data Use Agreement (DUA), pledging to protect patient privacy and cite the data source.</li>
          </ul>
          <h4 className="font-semibold text-slate-800 text-base mt-4 mb-2">Data Value & Use Cases</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Comprehensive EHR Data:</strong> Includes demographics, ICU stays, lab results, medications, and over 100 million clinical observations.</li>
            <li><strong>High-Resolution Time Series:</strong> Granular, minute-by-minute data for thousands of ICU patients, ideal for predictive modeling.</li>
            <li><strong>Research Standard:</strong> A foundational dataset for developing and validating algorithms for sepsis prediction, mortality risk, and more.</li>
          </ul>
        </>
      }
    >
      <DataDisplay<MimicIvData>
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

export default MIMICIV;
