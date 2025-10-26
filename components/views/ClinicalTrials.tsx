
import React, { useCallback } from 'react';
import { ClinicalTrial, DataSource } from '../../types';
import { fetchClinicalTrialsData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const ClinicalTrials: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchClinicalTrialsData(pageToken), []);
  const { data, isLoading, error, fetchData, fetchPage } = useSnapshotFetcher<ClinicalTrial>(fetcher);
  
  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes('recruiting')) return 'bg-green-100 text-green-800';
    if (status.toLowerCase().includes('active')) return 'bg-blue-100 text-blue-800';
    return 'bg-slate-100 text-slate-800';
  }
  
  const renderCards = (d: ClinicalTrial[]) => (
    <div className="space-y-4">
      {d.map((trial) => (
        <div key={trial.NCTId} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-md text-slate-800 flex-1 pr-2">{trial.BriefTitle}</h3>
            <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(trial.OverallStatus)}`}>{trial.OverallStatus}</span>
          </div>
          <p className="text-xs text-slate-500 mb-2 font-mono">{trial.NCTId}</p>
          <p className="text-sm text-slate-700"><strong>Condition:</strong> {trial.Condition.join(', ')}</p>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="ClinicalTrials.gov"
      description="Search and retrieve data for clinical studies from the ClinicalTrials.gov API."
      sourceUrl="https://clinicaltrials.gov/"
      ingestion={
        <>
          <p><strong>Method:</strong> REST API Call (JSON)</p>
          <p>The backend executes ClinicalTrials.gov queries, normalizes the response, and publishes it as a snapshot enriched with pagination tokens and download metadata.</p>
          <p>The real API allows for complex queries and filtering, for example: <code>/api/query/study_fields?expr=diabetes</code></p>
        </>
      }
    >
      <DataDisplay<ClinicalTrial>
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

export default ClinicalTrials;
