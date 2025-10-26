import React, { useCallback } from 'react';
import { OpenFDAEndpoint, DataSource } from '../../types';
import { fetchOpenFDAData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const OpenFDA: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchOpenFDAData(pageToken), []);
  const { data, isLoading, error, fetchData, fetchPage } = useSnapshotFetcher<OpenFDAEndpoint>(fetcher);

  const renderCards = (d: OpenFDAEndpoint[]) => (
    <div className="space-y-4">
      {d.map((item, index) => (
        <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-md text-slate-800">{item.name} Endpoint</h3>
          <p className="text-sm text-slate-700 mt-1">{item.description}</p>
          <p className="text-sm text-slate-500 mt-2 font-mono bg-slate-200 p-2 rounded">
            Example: <code>{item.example_query}</code>
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="OpenFDA API Endpoints"
      description="Structured access to a wide range of FDA data, including drug labels, adverse events, and enforcement reports."
      sourceUrl="https://open.fda.gov/"
      ingestion={
        <>
          <p><strong>Method:</strong> REST API</p>
          <p>OpenFDA provides numerous API endpoints that allow for complex queries and structured JSON responses, ideal for application integration.</p>
        </>
      }
    >
      <DataDisplay<OpenFDAEndpoint>
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

export default OpenFDA;
