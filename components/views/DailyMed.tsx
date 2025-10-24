
import React, { useState, useCallback } from 'react';
import { DailyMedDrug, DataSource } from '../../types';
import { fetchDailyMedData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';

const DailyMed: React.FC = () => {
  const [data, setData] = useState<DailyMedDrug[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDailyMedData();
      setData(result);
    } catch (e) {
      setError('Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const renderTable = (d: DailyMedDrug[]) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Drug Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Updated</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {d.map((drug, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{drug.drug_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{drug.last_updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );

  return (
    <DataSourceCard
      title="FDA DailyMed"
      description="Access all drug names and their last updated timestamps from the DailyMed REST API."
      sourceUrl="https://dailymed.nlm.nih.gov/dailymed/"
      ingestion={
        <>
          <p><strong>Method:</strong> REST API Call</p>
          <p>This component simulates calls to <code>services/v2/drugnames</code>. In a real application, this would involve paginating through results to build a complete dataset.</p>
          <p><strong>Note:</strong> Direct API calls from the browser may be blocked by CORS. A backend proxy is often required.</p>
        </>
      }
    >
      <DataDisplay<DailyMedDrug>
        data={data}
        error={error}
        isLoading={isLoading}
        fetchData={handleFetchData}
        renderData={renderTable}
      />
    </DataSourceCard>
  );
};

export default DailyMed;