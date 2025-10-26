
import React, { useState, useCallback, useEffect } from 'react';
import { UspstfRecommendation, DataSource } from '../../types';
import { fetchUspstfData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const USPSTF: React.FC = () => {
  const [age, setAge] = useState(55);
  const [sex, setSex] = useState<'Male' | 'Female'>('Male');
  const [tobacco, setTobacco] = useState(true);
  const fetcher = useCallback(
    (pageToken?: string) => fetchUspstfData(age, sex, tobacco, pageToken),
    [age, sex, tobacco],
  );
  const { snapshot, isLoading, isRefreshing, error, fetchLatest, loadPage, reset } =
    useSnapshotFetcher<UspstfRecommendation>(fetcher);

  useEffect(() => {
    reset();
  }, [age, sex, tobacco, reset]);

  const getGradeColor = (grade: string) => {
    switch(grade) {
        case 'A': return 'bg-green-100 text-green-800';
        case 'B': return 'bg-blue-100 text-blue-800';
        case 'C': return 'bg-yellow-100 text-yellow-800';
        case 'D': return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
  };
  
  return (
    <DataSourceCard
      title="USPSTF Recommendations"
      description="Fetches patient-specific screening recommendations from the U.S. Preventive Services Task Force."
      sourceUrl="https://www.uspreventiveservicestaskforce.org/uspstf/"
      ingestion={
        <>
          <p><strong>Method:</strong> REST API with Key</p>
          <p>Access requires an API key. The API returns JSON recommendations based on patient characteristics (age, sex, tobacco use, etc.).</p>
          <p>The backend applies those parameters, stores the response as a snapshot, and surfaces the timestamped recommendations with pagination and download links.</p>
        </>
      }
    >
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Patient Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">Age</label>
                <input type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value, 10))} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm bg-white"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">Sex</label>
                <select value={sex} onChange={(e) => setSex(e.target.value as 'Male' | 'Female')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm bg-white">
                    <option>Male</option>
                    <option>Female</option>
                </select>
            </div>
            <div className="flex items-end">
                <div className="flex items-center">
                    <input type="checkbox" checked={tobacco} onChange={(e) => setTobacco(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 bg-white"/>
                    <label className="ml-2 block text-sm text-slate-900">Tobacco Use</label>
                </div>
            </div>
        </div>
        <div className="text-center mb-4">
          <button
            onClick={fetchLatest}
            disabled={isLoading || isRefreshing}
            className="px-6 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 disabled:bg-slate-400"
          >
            {isLoading ? 'Fetching...' : 'Get Recommendations'}
          </button>
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {snapshot && (
            <>
              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <span className="font-semibold text-slate-700">Source:</span> {snapshot.snapshot.source}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Snapshot:</span> {snapshot.snapshot.timestamp}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Cache:</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        snapshot.snapshot.isFromCache ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {snapshot.snapshot.isFromCache ? 'Served from cache' : 'Fresh snapshot'}
                    </span>
                  </div>
                </div>
              </div>
            <div className="space-y-4">
                {snapshot.items.map((rec, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                           <h4 className="font-semibold text-slate-800 flex-1 pr-2">{rec.screening}</h4>
                           <span className={`text-sm font-bold px-3 py-1 rounded-full ${getGradeColor(rec.grade)}`}>Grade {rec.grade}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{rec.rationale}</p>
                    </div>
                ))}
            </div>
              {(snapshot.pagination?.previousToken || snapshot.pagination?.nextToken) && (
                <div className="mt-6 flex justify-end gap-3">
                  {snapshot.pagination?.previousToken && (
                    <button
                      onClick={() => snapshot.pagination?.previousToken && loadPage(snapshot.pagination.previousToken)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      Previous Page
                    </button>
                  )}
                  {snapshot.pagination?.nextToken && (
                    <button
                      onClick={() => snapshot.pagination?.nextToken && loadPage(snapshot.pagination.nextToken)}
                      className="px-4 py-2 rounded-lg bg-cyan-500 text-white font-semibold shadow hover:bg-cyan-600"
                    >
                      Next Page
                    </button>
                  )}
                </div>
              )}
              {snapshot.downloadUrl && (
                <div className="mt-4 text-right">
                  <a
                    href={snapshot.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    Download full snapshot
                  </a>
                </div>
              )}
            </>
        )}
      </div>
    </DataSourceCard>
  );
};

export default USPSTF;
