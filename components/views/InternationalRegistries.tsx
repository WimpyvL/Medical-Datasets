
import React, { useCallback } from 'react';
import { InternationalRegistry } from '../../types';
import { fetchInternationalRegistriesData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const InternationalRegistries: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchInternationalRegistriesData(pageToken), []);
  const { data, isLoading, error, fetchData, fetchPage } = useSnapshotFetcher<InternationalRegistry>(fetcher);

  const renderCards = (d: InternationalRegistry[]) => (
    <div className="space-y-4">
      {d.map((item, index) => (
        <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-md text-slate-800 flex-1 pr-2">{item.name}</h3>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-200 text-slate-700 whitespace-nowrap">{item.country}</span>
          </div>
          <p className="text-sm text-slate-700 mt-2">{item.description}</p>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="International Registries & Datasets"
      description="De-identified claims, registry, or EHR data from various countries, available for research."
      sourceUrl="https://www.cprd.com/"
      ingestion={
        <>
          <h4 className="font-semibold text-slate-800 text-base mb-2">Access & Cost</h4>
          <p className="mb-2"><strong>Cost:</strong> Significant. Can range from thousands to tens of thousands of dollars depending on the data scope.</p>
          <p className="mb-2"><strong>Requirements:</strong></p>
          <ul className="list-disc list-inside space-y-1">
              <li>A formal, detailed research proposal.</li>
              <li>Institutional Review Board (IRB) or ethics approval.</li>
              <li>Review and approval by the data provider's scientific committee.</li>
              <li>Lengthy process, often taking many months.</li>
          </ul>
          <h4 className="font-semibold text-slate-800 text-base mt-4 mb-2">Data Value & Use Cases</h4>
          <ul className="list-disc list-inside space-y-1">
              <li><strong>Population-Level Scale:</strong> Cover entire provinces or countries, providing immense statistical power.</li>
              <li><strong>Real-World Evidence (RWE):</strong> Essential for understanding how treatments perform outside of controlled clinical trials.</li>
              <li><strong>Health Policy Evaluation:</strong> Used by governments and researchers to assess the impact of healthcare policies.</li>
          </ul>
        </>
      }
    >
      <DataDisplay<InternationalRegistry>
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

export default InternationalRegistries;
