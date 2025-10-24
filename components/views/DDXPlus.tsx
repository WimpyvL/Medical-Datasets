
import React, { useState, useCallback } from 'react';
import { DdxPlusRecord } from '../../types';
import { fetchDdxPlusData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';

const DDXPlus: React.FC = () => {
  const [data, setData] = useState<DdxPlusRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDdxPlusData();
      setData(result);
    } catch (e) {
      setError('Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderCards = (d: DdxPlusRecord[]) => (
    <div className="space-y-4">
      {d.map((item) => (
        <div key={item.record_id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-md text-slate-800">Diagnosis: {item.diagnosis}</h3>
          <p className="text-xs text-slate-500 mb-2">Record ID: {item.record_id}</p>
          <p className="text-sm text-slate-700"><strong>Symptoms:</strong> {item.symptoms_detected.join(', ')}</p>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="DDXPlus Dataset (English)"
      description="A large-scale synthetic dataset for Automatic Diagnosis (AD) and Automatic Symptom Detection (ASD), containing roughly 1.3 million patient records."
      sourceUrl="https://figshare.com/articles/dataset/DDXPlus_Dataset_English_/22687585"
      ingestion={
        <>
          <p><strong>Method:</strong> Research Data Repository (Figshare)</p>
          <p>This dataset is hosted on Figshare, a platform for researchers to share supplementary materials, making it a valuable find outside of typical data portals.</p>
        </>
      }
    >
      <DataDisplay<DdxPlusRecord>
        data={data}
        error={error}
        isLoading={isLoading}
        fetchData={handleFetchData}
        renderData={renderCards}
      />
    </DataSourceCard>
  );
};

export default DDXPlus;