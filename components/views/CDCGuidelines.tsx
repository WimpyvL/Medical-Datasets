
import React, { useCallback } from 'react';
import { Guideline, DataSource } from '../../types';
import { fetchGuidelineData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const CDCGuidelines: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchGuidelineData(pageToken), []);
  const { data, isLoading, error, fetchData, fetchPage } = useSnapshotFetcher<Guideline>(fetcher);
  
  const renderCards = (d: Guideline[]) => (
    <div className="space-y-4">
      {d.map((guideline, index) => (
        <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-md text-slate-800">{guideline.guideline_title} ({guideline.source})</h3>
          <p className="text-xs text-slate-500 mb-2">Version: {guideline.version_date}</p>
          {guideline.recommendations.map((rec, recIndex) => (
             <div key={recIndex} className="mt-2 pt-2 border-t border-slate-200/50 first:mt-0 first:pt-0 first:border-none">
                <p className="text-sm text-slate-700">
                    <strong>{rec.section}:</strong> {rec.statement}
                </p>
                <p className="text-xs text-slate-500">
                    Evidence Grade: {rec.evidence_grade}
                </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="CDC/NIH & Other Clinical Guidelines"
      description="Clinical practice guidelines from sources like the CDC, VA/DoD, and other professional organizations."
      sourceUrl="https://www.cdc.gov/publications/index.html"
      ingestion={
        <>
          <p><strong>Method:</strong> Web Scraping & PDF Parsing</p>
          <p>Guidelines are often published as web pages or PDF documents. Ingestion requires a backend to scrape HTML or use a library (like PDF.js) to extract text, followed by NLP to identify key sections like recommendations and evidence grading.</p>
          <p>Each processing run is persisted as a snapshot so analysts can reference the timestamped recommendation set and download the underlying source bundle.</p>
        </>
      }
    >
      <DataDisplay<Guideline>
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

export default CDCGuidelines;
