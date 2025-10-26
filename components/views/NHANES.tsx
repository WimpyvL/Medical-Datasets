import React, { useCallback } from 'react';
import { NhanesData, DataSource } from '../../types';
import { fetchNhanesData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const NHANES: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchNhanesData(pageToken), []);
  const { data, isLoading, error, fetchData, fetchPage } = useSnapshotFetcher<NhanesData>(fetcher);

  const renderCards = (d: NhanesData[]) => (
    <div className="space-y-4">
      {d.map((item, index) => (
        <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-md text-slate-800 flex-1 pr-2">{item.component} Component</h3>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-200 text-slate-700 whitespace-nowrap">{item.data_cycle}</span>
          </div>
          <p className="text-sm text-slate-700 mt-2">{item.description}</p>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="National Health and Nutrition Examination Survey (NHANES)"
      description="Publishes public-use datasets covering laboratory tests, physical examinations, and questionnaire responses from thousands of participants."
      sourceUrl="https://www.cdc.gov/nchs/nhanes/index.htm"
      ingestion={
        <>
          <p><strong>Method:</strong> Public Data Download</p>
          <p>The CDC's NHANES portal hosts public data files for various multi-year cycles, which can be downloaded for research and analysis.</p>
        </>
      }
    >
      <DataDisplay<NhanesData>
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

export default NHANES;
