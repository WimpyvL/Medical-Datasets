import React, { useCallback } from 'react';
import { NppesData, DataSource } from '../../types';
import { fetchNppesData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const NPPES: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchNppesData(pageToken), []);
  const { snapshot, isLoading, isRefreshing, error, fetchLatest, loadPage } = useSnapshotFetcher<NppesData>(fetcher);
  const downloadUrl = snapshot?.downloadUrl;
  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  }, [downloadUrl]);

  const renderTable = (d: NppesData[]) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NPI</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Provider Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">State</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {d.map((item) => (
            <tr key={item.npi}>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{item.npi}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.name}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{item.provider_type}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{item.state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <DataSourceCard
      title="National Plan & Provider Enumeration System (NPPES)"
      description="Public datasets from CMS listing providers, facilities, utilization, and cost information."
      sourceUrl="https://www.cms.gov/Regulations-and-Guidance/Administrative-Simplification/NationalProvIdentStand"
      ingestion={
        <>
          <p><strong>Method:</strong> Public Data Download</p>
          <p>The NPPES data is available for download from CMS, providing a comprehensive directory of all active National Provider Identifiers (NPIs).</p>
        </>
      }
    >
      <DataDisplay<NppesData>
        snapshot={snapshot}
        error={error}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onFetchLatest={fetchLatest}
        onLoadPage={loadPage}
        onDownload={downloadUrl ? handleDownload : undefined}
        renderData={renderTable}
      />
    </DataSourceCard>
  );
};

export default NPPES;
