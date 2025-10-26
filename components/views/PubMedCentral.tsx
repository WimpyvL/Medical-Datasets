import React, { useCallback } from 'react';
import { PubMedArticle, DataSource } from '../../types';
import { fetchPubMedCentralData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const PubMedCentral: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchPubMedCentralData(pageToken), []);
  const { snapshot, isLoading, isRefreshing, error, fetchLatest, loadPage } = useSnapshotFetcher<PubMedArticle>(fetcher);
  const downloadUrl = snapshot?.downloadUrl;
  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  }, [downloadUrl]);

  const renderCards = (d: PubMedArticle[]) => (
    <div className="space-y-4">
      {d.map((item) => (
        <div key={item.pmcid} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-md text-slate-800">{item.title}</h3>
          <p className="text-xs text-slate-500 mb-2">PMCID: {item.pmcid} | Journal: <em>{item.journal}</em></p>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="PubMed Central Open-Access Subset"
      description="Millions of full-text biomedical and life sciences journal articles that can be downloaded for text mining and evidence extraction."
      sourceUrl="https://www.ncbi.nlm.nih.gov/pmc/tools/openftlist/"
      ingestion={
        <>
          <p><strong>Method:</strong> Bulk Download / FTP</p>
          <p>The entire open-access subset is available for bulk download via FTP from the NCBI. This allows for large-scale text analysis and natural language processing.</p>
        </>
      }
    >
      <DataDisplay<PubMedArticle>
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

export default PubMedCentral;
