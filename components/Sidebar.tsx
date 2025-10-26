import React from 'react';
import { DataSource } from '../types';
import { ApiIcon, BookIcon, ClinicalTrialIcon, DocumentIcon, DnaIcon, FileTextIcon, HeartIcon, SearchIcon, EHRICUIcon, SafetyIcon, RegistryIcon, GlobeIcon, DatabaseIcon, ChartBarIcon, UsersIcon, IngestionIcon, FlaskIcon } from './icons/Icons';

interface SidebarProps {
  activeSource: DataSource | null;
  setActiveSource: (source: DataSource) => void;
}

const actions = [
    { id: DataSource.DataIngestion, icon: <IngestionIcon /> },
    { id: DataSource.FireScrapeTool, icon: <SearchIcon /> },
];

const freeDataSources = [
    { id: DataSource.DailyMed, icon: <ApiIcon /> },
    { id: DataSource.OrangeBook, icon: <BookIcon /> },
    { id: DataSource.OpenFDA, icon: <ApiIcon /> },
    { id: DataSource.FAERS, icon: <SafetyIcon /> },
    { id: DataSource.CMS_PUF, icon: <DatabaseIcon /> },
    { id: DataSource.SEER, icon: <RegistryIcon /> },
    { id: DataSource.NHANES, icon: <ChartBarIcon /> },
    { id: DataSource.NPPES, icon: <UsersIcon /> },
    { id: DataSource.ClinicalTrials, icon: <ClinicalTrialIcon /> },
    { id: DataSource.PubMedCentral, icon: <BookIcon /> },
    { id: DataSource.MedlinePlus, icon: <SearchIcon /> },
    { id: DataSource.CDCGuidelines, icon: <DocumentIcon /> },
    { id: DataSource.NIHSafety, icon: <FileTextIcon /> },
    { id: DataSource.StatPearls, icon: <DnaIcon /> },
    { id: DataSource.USPSTF, icon: <HeartIcon /> },
    { id: DataSource.Synthea, icon: <DnaIcon /> },
];

const restrictedDataSources = [
    { id: DataSource.MIMIC_IV, icon: <EHRICUIcon /> },
    { id: DataSource.EICU_CRD, icon: <EHRICUIcon /> },
    { id: DataSource.InternationalRegistries, icon: <GlobeIcon /> },
];

const rareFindsDataSources = [
    { id: DataSource.CheXpertSplits, icon: <FlaskIcon /> },
    { id: DataSource.MIMICSplits, icon: <FlaskIcon /> },
    { id: DataSource.RIDCOVID, icon: <FlaskIcon /> },
    { id: DataSource.RJUAQA, icon: <FlaskIcon /> },
    { id: DataSource.DDXPlus, icon: <FlaskIcon /> },
    { id: DataSource.LUNA16, icon: <FlaskIcon /> },
];


const Sidebar: React.FC<SidebarProps> = ({ activeSource, setActiveSource }) => {
  const renderLink = (id: DataSource, icon: React.ReactNode) => {
    const isActive = activeSource === id;
    return (
      <button
        key={id}
        onClick={() => setActiveSource(id)}
        className={`flex items-center p-3 w-full text-sm font-medium rounded-lg transition-colors duration-150
          ${isActive
            ? 'bg-cyan-500 text-white shadow-lg'
            : 'text-slate-600 hover:bg-slate-200'
          }`}
      >
        <div className="w-6 h-6">{icon}</div>
        <span className="hidden md:block ml-4">{id}</span>
      </button>
    );
  };
  
  const renderSection = (title: string, sources: {id: DataSource, icon: React.ReactNode}[]) => (
    <div>
        <h3 className="px-3 pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:block">
            {title}
        </h3>
        <div className="space-y-2">
            {sources.map(({ id, icon }) => renderLink(id, icon))}
        </div>
    </div>
  );

  return (
    <aside className="w-16 md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300">
      <div className="flex items-center justify-center md:justify-start p-4 h-16 border-b border-slate-200 flex-shrink-0">
        <DnaIcon className="h-8 w-8 text-cyan-500" />
        <h1 className="hidden md:block ml-3 text-xl font-bold text-slate-800">
          Data Hub
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 py-4">
            {renderSection('Actions', actions)}
            {renderSection('Freely Accessible', freeDataSources)}
            {renderSection('Restricted Access', restrictedDataSources)}
            {renderSection('Rare Finds & Specialized', rareFindsDataSources)}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;