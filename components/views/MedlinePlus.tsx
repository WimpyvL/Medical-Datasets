
import React, { useCallback } from 'react';
import { MedlinePlusTopic, DataSource } from '../../types';
import { fetchMedlinePlusData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const MedlinePlus: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchMedlinePlusData(pageToken), []);
  const { snapshot, isLoading, isRefreshing, error, fetchLatest, loadPage } = useSnapshotFetcher<MedlinePlusTopic>(fetcher);
  const downloadUrl = snapshot?.downloadUrl;
  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  }, [downloadUrl]);
  
  const renderCards = (d: MedlinePlusTopic[]) => (
    <div className="space-y-4">
      {d.map((topic) => (
        <div key={topic.title} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <a href={topic.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-md text-cyan-600 hover:underline">{topic.title}</a>
          <p className="text-sm text-slate-700 mt-2">{topic.summary}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topic.mesh_terms.map(term => (
                 <span key={term} className="text-xs font-medium px-2.5 py-0.5 rounded bg-slate-200 text-slate-800">{term}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="MedlinePlus Health Topics"
      description="Information on health topics from MedlinePlus, sourced from daily XML files."
      sourceUrl="https://medlineplus.gov/"
      ingestion={
        <>
          <p><strong>Method:</strong> XML File Download & Parsing</p>
          <p>This process requires a backend to: (1) Download the compressed XML file from medlineplus.gov, (2) Extract the XML, and (3) Parse each <code>&lt;record&gt;</code> element into structured fields.</p>
          <p>The data shown is a sample of the parsed XML content.</p>
        </>
      }
    >
      <DataDisplay<MedlinePlusTopic>
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

export default MedlinePlus;
