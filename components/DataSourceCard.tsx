
import React from 'react';
import { ExternalLinkIcon } from './icons/Icons';

interface DataSourceCardProps {
  title: string;
  description: React.ReactNode;
  ingestion: React.ReactNode;
  children: React.ReactNode;
  sourceUrl?: string;
}

const DataSourceCard: React.FC<DataSourceCardProps> = ({ title, description, ingestion, children, sourceUrl }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex-shrink-0"
            >
              <span className="hidden sm:inline mr-2 text-sm font-medium">Visit Source</span>
              <ExternalLinkIcon className="w-5 h-5" />
            </a>
          )}
        </div>
        <p className="text-slate-600">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 h-full">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Ingestion & Processing</h2>
            <div className="text-sm text-slate-600 space-y-2">
              {ingestion}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DataSourceCard;
