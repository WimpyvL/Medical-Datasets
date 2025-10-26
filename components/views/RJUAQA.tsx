
import React, { useCallback } from 'react';
import { RjuaQaPair } from '../../types';
import { fetchRjuaQaData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const RJUAQA: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchRjuaQaData(pageToken), []);
  const { data, isLoading, error, fetchData, fetchPage } = useSnapshotFetcher<RjuaQaPair>(fetcher);

  const renderCards = (d: RjuaQaPair[]) => (
    <div className="space-y-4">
      {d.map((item, index) => (
        <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-semibold text-slate-800">Q: {item.question}</p>
          <p className="text-sm text-slate-700 mt-2">A: {item.answer}</p>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="RJUA-QA: Urology Question-Answering"
      description="A novel, specialized Q&A dataset for Urology containing pairs derived from virtual patient clinical dialogues, ideal for clinical reasoning models."
      sourceUrl="http://data.openkg.cn/en_GB/dataset/rjua-qadatasets"
      ingestion={
        <>
          <p><strong>Method:</strong> Academic Data Portal</p>
          <p>Hosted on OpenKG, a repository for open knowledge graph data. This dataset is designed for fine-tuning LLMs for medical QA tasks.</p>
        </>
      }
    >
      <DataDisplay<RjuaQaPair>
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

export default RJUAQA;
