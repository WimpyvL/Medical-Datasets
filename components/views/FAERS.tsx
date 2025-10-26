import React, { useCallback } from 'react';
import { FaersData, DataSource } from '../../types';
import { fetchFaersData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const FAERS: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchFaersData(pageToken), []);
  const { snapshot, isLoading, isRefreshing, error, fetchLatest, loadPage } = useSnapshotFetcher<FaersData>(fetcher);
  const downloadUrl = snapshot?.downloadUrl;
  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  }, [downloadUrl]);

  const renderTable = (d: FaersData[]) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Report ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reaction</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {d.map((item) => (
            <tr key={item.report_id}>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{item.report_id}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.product_name}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{item.reaction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <DataSourceCard
      title="FDA Adverse Event Reporting System (FAERS)"
      description="Contains information on adverse event and medication error reports submitted to the FDA for post-marketing safety surveillance."
      sourceUrl="https://open.fda.gov/data/faers/"
      ingestion={
        <>
          <p><strong>Method:</strong> Bulk Download</p>
          <p>Quarterly data files are publicly available for download from the FDA website. These files are typically large and require backend processing to be loaded into a database.</p>
        </>
      }
    >
      <DataDisplay<FaersData>
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

export default FAERS;
