
import React, { useCallback } from 'react';
import { MimicSplit } from '../../types';
import { fetchMimicSplitsData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const MIMICSplits: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchMimicSplitsData(pageToken), []);
  const { data, isLoading, error, fetchData, fetchPage } = useSnapshotFetcher<MimicSplit>(fetcher);

  const renderTable = (d: MimicSplit[]) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Split Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">File Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {d.map((item) => (
            <tr key={item.file_name}>
              <td className="px-4 py-4 whitespace-nowrap text-sm"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{item.split_type}</span></td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{item.file_name}</td>
              <td className="px-4 py-4 text-sm text-slate-600">{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <DataSourceCard
      title="SyntheticallyEnhanced: MIMIC Splits"
      description="Contains the pre-processed CSV metadata splits for the MIMIC-CXR dataset, ready for use in deep learning models."
      sourceUrl="https://github.com/BardiaKh/SyntheticallyEnhanced/tree/main/data_splits/MIMIC"
      ingestion={
        <>
          <p><strong>Method:</strong> Direct File Link</p>
          <p>Similar to the CheXpert splits, these files provide ready-to-use metadata for MIMIC-CXR, accelerating the setup for research and model training.</p>
        </>
      }
    >
      <DataDisplay<MimicSplit>
        data={data}
        error={error}
        isLoading={isLoading}
        fetchData={fetchData}
        fetchPage={fetchPage}
        renderData={renderTable}
      />
    </DataSourceCard>
  );
};

export default MIMICSplits;
