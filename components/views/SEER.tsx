import React, { useState, useCallback } from 'react';
import { SeerData, DataSource } from '../../types';
import { fetchSeerData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';

const SEER: React.FC = () => {
  const [data, setData] = useState<SeerData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchSeerData();
      setData(result);
    } catch (e) {
      setError('Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderTable = (d: SeerData[]) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cancer Site</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Incidence / 100k</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">5-Year Survival</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {d.map((item) => (
            <tr key={item.cancer_site}>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.cancer_site}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{item.incidence_rate_per_100k}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{item.five_year_survival_rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <DataSourceCard
      title="SEER Program"
      description="The Surveillance, Epidemiology, and End Results (SEER) Program provides population-based cancer incidence and survival data."
      sourceUrl="https://seer.cancer.gov/"
      ingestion={
        <>
          <p><strong>Method:</strong> Public-Use Data Files</p>
          <p>The NCI releases an open research dataset annually, which includes incidence and population data that can be downloaded for analysis.</p>
        </>
      }
    >
      <DataDisplay<SeerData>
        data={data}
        error={error}
        isLoading={isLoading}
        fetchData={handleFetchData}
        renderData={renderTable}
      />
    </DataSourceCard>
  );
};

export default SEER;