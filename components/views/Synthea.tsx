import React, { useCallback } from 'react';
import { SyntheaPatient, DataSource } from '../../types';
import { fetchSyntheaData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const Synthea: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchSyntheaData(pageToken), []);
  const { data, isLoading, error, fetchData, fetchPage } = useSnapshotFetcher<SyntheaPatient>(fetcher);

  const renderCards = (d: SyntheaPatient[]) => (
    <div className="space-y-4">
      {d.map((item) => (
        <div key={item.patient_id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-md text-slate-800">Patient ID: {item.patient_id}</h3>
          <p className="text-sm text-slate-700 mt-2"><strong>Conditions:</strong> {item.conditions.join(', ')}</p>
          <p className="text-sm text-slate-700 mt-1"><strong>Medications:</strong> {item.medications.join(', ')}</p>
        </div>
      ))}
    </div>
  );

  return (
    <DataSourceCard
      title="Synthea™ Synthetic Patient Data"
      description="A tool from MITRE that generates realistic but fictional electronic health records for testing and algorithm development."
      sourceUrl="https://synthetichealth.github.io/synthea/"
      ingestion={
        <>
          <p><strong>Method:</strong> Synthetic Data Generation</p>
          <p>Researchers can run the open-source Synthea tool locally to generate custom datasets. Pre-generated datasets (like SyntheticMass) are also available for download.</p>
        </>
      }
    >
      <DataDisplay<SyntheaPatient>
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

export default Synthea;
