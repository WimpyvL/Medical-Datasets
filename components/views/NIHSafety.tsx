
import React, { useCallback } from 'react';
import { NihSafetyRecord, DataSource } from '../../types';
import { fetchNihSafetyData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const NIHSafety: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchNihSafetyData(pageToken), []);
  const { data, isLoading, error, fetchData, fetchPage } = useSnapshotFetcher<NihSafetyRecord>(fetcher);
  
  const renderCards = (d: NihSafetyRecord[]) => (
    <div className="space-y-4">
      {d.map((record, index) => (
        <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-md text-slate-800">{record.generic_name}</h3>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${record.source === 'LactMed' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>{record.source}</span>
          </div>
          <p className="text-sm text-slate-700 mt-2">{record.summary}</p>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="NIH Drug-Safety Resources"
      description="Information from LactMed (Drugs and Lactation) and LiverTox (Drug-Induced Liver Injury)."
      sourceUrl="https://www.ncbi.nlm.nih.gov/books/NBK501922/"
      ingestion={
        <>
          <p><strong>Method:</strong> Web Scraping</p>
          <p>Because there is no public API, data must be scraped from the NCBI Bookshelf web pages. This requires a backend process using libraries like <code>BeautifulSoup</code> or <code>Puppeteer</code> to parse the HTML and extract structured fields.</p>
          <p><strong>Note:</strong> Browser-based scraping is not feasible due to CORS policies, so the backend caches the harvested content as timestamped snapshots for reuse.</p>
        </>
      }
    >
      <DataDisplay<NihSafetyRecord>
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

export default NIHSafety;
