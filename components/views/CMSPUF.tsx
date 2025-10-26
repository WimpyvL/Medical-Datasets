import React, { useCallback } from 'react';
import { CmsPufData, DataSource } from '../../types';
import { fetchCmsPufData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const CMSPUF: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchCmsPufData(pageToken), []);
  const { snapshot, isLoading, isRefreshing, error, fetchLatest, loadPage } = useSnapshotFetcher<CmsPufData>(fetcher);
  const downloadUrl = snapshot?.downloadUrl;
  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  }, [downloadUrl]);

  const renderCards = (d: CmsPufData[]) => (
    <div className="space-y-4">
      {d.map((item, index) => (
        <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-md text-slate-800 flex-1 pr-2">{item.file_name}</h3>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-200 text-slate-700 whitespace-nowrap">{item.category}</span>
          </div>
          <p className="text-sm text-slate-700 mt-2">{item.description}</p>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="CMS Public-Use Files (PUFs)"
      description="De-identified data files from the Centers for Medicare & Medicaid Services on utilization, providers, and quality measures."
      sourceUrl="https://data.cms.gov/"
      ingestion={
        <>
          <p><strong>Method:</strong> Public Data Download</p>
          <p>CMS makes many non-identifiable datasets freely available for download from its open data portals. Synthetic Medicare claims are also provided for researchers.</p>
        </>
      }
    >
      <DataDisplay<CmsPufData>
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

export default CMSPUF;
