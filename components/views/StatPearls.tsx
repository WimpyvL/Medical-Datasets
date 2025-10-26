
import React, { useCallback } from 'react';
import { StatPearlsChapter, DataSource } from '../../types';
import { fetchStatPearlsData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const StatPearls: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchStatPearlsData(pageToken), []);
  const { data, isLoading, error, fetchData, fetchPage } = useSnapshotFetcher<StatPearlsChapter>(fetcher);
  
  const renderCards = (d: StatPearlsChapter[]) => (
     <div className="space-y-4">
      {d.map((chapter) => (
        <div key={chapter.book_id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-md text-slate-800">{chapter.title}</h3>
          <p className="text-xs text-slate-500 mb-2">ID: {chapter.book_id}</p>
          <p className="text-sm text-slate-700">{chapter.summary}</p>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="StatPearls & NCBI E-utilities"
      description="Access chapters and summaries from StatPearls via the NCBI E-utilities API."
      sourceUrl="https://www.ncbi.nlm.nih.gov/books/NBK430685/"
      ingestion={
        <>
          <p><strong>Method:</strong> NCBI E-utilities API</p>
          <p>The process involves: (1) Using <code>esearch.fcgi</code> to find Book IDs for StatPearls content, and (2) Calling <code>efetch.fcgi</code> with those IDs to retrieve chapter content in XML format, which is then parsed.</p>
          <p>The backend now orchestrates those fetches, versioning each response into a snapshot so downstream consumers get consistent metadata, pagination, and full-download links.</p>
        </>
      }
    >
      <DataDisplay<StatPearlsChapter>
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

export default StatPearls;
