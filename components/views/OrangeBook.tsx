
import React, { useCallback } from 'react';
import { OrangeBookProduct, DataSource } from '../../types';
import { fetchOrangeBookData } from '../../services/medicalDataService';
import DataSourceCard from '../DataSourceCard';
import DataDisplay from '../DataDisplay';
import { useSnapshotFetcher } from '../hooks/useSnapshotFetcher';

const OrangeBook: React.FC = () => {
  const fetcher = useCallback((pageToken?: string) => fetchOrangeBookData(pageToken), []);
  const { snapshot, isLoading, isRefreshing, error, fetchLatest, loadPage } = useSnapshotFetcher<OrangeBookProduct>(fetcher);
  const downloadUrl = snapshot?.downloadUrl;
  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  }, [downloadUrl]);

  const renderTable = (d: OrangeBookProduct[]) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Application</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Active Ingredient</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">TE Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patents</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {d.map((product) => (
              <tr key={product.Application_Number + product.Product_No}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{product.Application_Number}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{product.Active_Ing}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{product.TE_Code}</span></td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{product.Patent_Numbers?.join(', ') || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );

  return (
    <DataSourceCard
      title="FDA Orange Book"
      description="Explore drug products with therapeutic equivalence evaluations, along with patent and exclusivity data."
      sourceUrl="https://www.fda.gov/drugs/drug-approvals-and-databases/approved-drug-products-therapeutic-equivalence-evaluations-orange-book"
      ingestion={
        <>
          <p><strong>Method:</strong> File Download & Parsing</p>
          <p>The full process requires a backend to: (1) Download the ZIP archive from the FDA website, (2) Unzip the archive, and (3) Parse the tab-delimited text files (Products.txt, Patent.txt, Exclusivity.txt).</p>
          <p>This component displays a pre-processed sample of this joined data.</p>
        </>
      }
    >
      <DataDisplay<OrangeBookProduct>
        snapshot={snapshot}
        error={error}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onFetchLatest={fetchLatest}
        onLoadPage={loadPage}
        onDownload={downloadUrl ? handleDownload : undefined}
        renderData={renderTable}
      />
    </DataSourceCard>
  );
};

export default OrangeBook;