
import React, { useCallback } from 'react';
import { RidCovidData } from '../../types';
import { fetchRidCovidData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const RIDCOVID: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchRidCovidData(pageToken), []);
  const { data, isLoading, error, fetchData, fetchPage } = useSnapshotFetcher<RidCovidData>(fetcher);

  const renderCards = (d: RidCovidData[]) => (
    <div className="space-y-4">
      {d.map((item, index) => (
        <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-md text-slate-800">Focus: {item.dataset_focus}</h3>
          <p className="text-sm text-slate-700 mt-2">{item.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-slate-200 text-slate-800">Modality: {item.modality}</span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-slate-200 text-slate-800">Annotation: {item.annotation_type}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="RID-COVID Dataset"
      description="A medical imaging dataset (X-ray, CT) focused on COVID-19 severity, a less-common annotation task."
      sourceUrl="https://drive.google.com/file/d/1BFQXXDpfPp-m79qGTViyddXij08Z4FJC/view"
      ingestion={
        <>
          <p><strong>Method:</strong> Direct Download (Google Drive)</p>
          <p>This dataset is shared via a direct link to a compressed archive, often found within academic GitHub repositories dedicated to specific research areas.</p>
        </>
      }
    >
      <DataDisplay<RidCovidData>
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

export default RIDCOVID;
