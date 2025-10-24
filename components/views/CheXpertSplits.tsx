
import React, { useState, useCallback } from 'react';
import { ChexpertSplit } from '../../types';
import { fetchChexpertSplitsData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';

const CheXpertSplits: React.FC = () => {
  const [data, setData] = useState<ChexpertSplit[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchChexpertSplitsData();
      setData(result);
    } catch (e) {
      setError('Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderTable = (d: ChexpertSplit[]) => (
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
      title="SyntheticallyEnhanced: CheXpert Splits"
      description="CSV metadata splits for the CheXpert dataset from a Lancet eBioMedicine study. They are pre-processed for training and validation, saving significant setup time."
      sourceUrl="https://github.com/BardiaKh/SyntheticallyEnhanced/tree/main/data_splits/CheXpert"
      ingestion={
        <>
          <p><strong>Method:</strong> Direct File Link</p>
          <p>These are direct links to CSV files in a GitHub repository, containing pre-processed metadata that saves significant setup time for deep learning experiments.</p>
        </>
      }
    >
      <DataDisplay<ChexpertSplit>
        data={data}
        error={error}
        isLoading={isLoading}
        fetchData={handleFetchData}
        renderData={renderTable}
      />
    </DataSourceCard>
  );
};

export default CheXpertSplits;