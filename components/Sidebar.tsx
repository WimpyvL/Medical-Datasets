import React, { useMemo } from 'react';
import { ACTION_IDS, SPECIAL_SOURCE_NAMES, DatasetSourceRecord } from '../types';
import {
  ApiIcon,
  BookIcon,
  ClinicalTrialIcon,
  DocumentIcon,
  DnaIcon,
  FileTextIcon,
  HeartIcon,
  SearchIcon,
  EHRICUIcon,
  SafetyIcon,
  RegistryIcon,
  GlobeIcon,
  DatabaseIcon,
  ChartBarIcon,
  UsersIcon,
  IngestionIcon,
  FlaskIcon,
} from './icons/Icons';

interface SidebarProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  datasets: DatasetSourceRecord[];
  isLoadingDatasets: boolean;
}

const ACTION_LINKS = [
  { id: ACTION_IDS.dataIngestion, label: SPECIAL_SOURCE_NAMES.dataIngestion, icon: <IngestionIcon /> },
  { id: ACTION_IDS.fireScrapeTool, label: SPECIAL_SOURCE_NAMES.fireScrapeTool, icon: <SearchIcon /> },
];

const DATASET_ICON_MAP: Record<string, React.ReactNode> = {
  DailyMed: <ApiIcon />,
  'Orange Book': <BookIcon />,
  OpenFDA: <ApiIcon />,
  FAERS: <SafetyIcon />,
  'CMS Public Use Files': <DatabaseIcon />,
  'SEER Program': <RegistryIcon />,
  NHANES: <ChartBarIcon />,
  NPPES: <UsersIcon />,
  'ClinicalTrials.gov': <ClinicalTrialIcon />,
  'PubMed Central': <BookIcon />,
  MedlinePlus: <SearchIcon />,
  'CDC/NIH Guidelines': <DocumentIcon />,
  'NIH Drug-Safety': <FileTextIcon />,
  StatPearls: <DnaIcon />,
  'USPSTF Recommendations': <HeartIcon />,
  Synthea: <DnaIcon />,
  'MIMIC-IV': <EHRICUIcon />,
  'eICU-CRD': <EHRICUIcon />,
  'International Registries': <GlobeIcon />,
  'SyntheticallyEnhanced: CheXpert': <FlaskIcon />,
  'SyntheticallyEnhanced: MIMIC': <FlaskIcon />,
  'RID-COVID': <FlaskIcon />,
  'RJUA-QA': <FlaskIcon />,
  'DDXPlus Dataset': <FlaskIcon />,
  LUNA16: <FlaskIcon />,
};

const getDatasetIcon = (name: string): React.ReactNode => DATASET_ICON_MAP[name] ?? <DatabaseIcon />;

const statusBadgeClass = (status: string | null): string => {
  if (!status) {
    return 'bg-slate-100 text-slate-600';
  }
  const normalized = status.toLowerCase();
  if (['completed', 'success', 'succeeded'].includes(normalized)) {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (['running', 'in_progress', 'processing', 'pending', 'queued'].includes(normalized)) {
    return 'bg-blue-100 text-blue-700';
  }
  if (['failed', 'error'].includes(normalized)) {
    return 'bg-rose-100 text-rose-700';
  }
  return 'bg-slate-100 text-slate-600';
};

const formatStatusLabel = (status: string | null): string => {
  if (!status) {
    return 'No snapshot';
  }
  return status;
};

const Sidebar: React.FC<SidebarProps> = ({ activeId, onSelect, datasets, isLoadingDatasets }) => {
  const datasetLinks = useMemo(
    () =>
      [...datasets]
        .sort((a, b) => a.source.localeCompare(b.source))
        .map((dataset) => ({
          id: dataset.source,
          label: dataset.source,
          status: dataset.latestSnapshot?.status ?? null,
          icon: getDatasetIcon(dataset.source),
        })),
    [datasets],
  );

  const renderLink = (id: string, label: string, icon: React.ReactNode, status: string | null = null) => {
    const isActive = activeId === id;
    return (
      <button
        key={id}
        onClick={() => onSelect(id)}
        className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
          isActive ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-200'
        }`}
      >
        <span className="flex items-center gap-3">
          <span className="w-5 h-5 flex items-center justify-center text-current">{icon}</span>
          <span className="hidden md:block text-left">{label}</span>
        </span>
        <span
          className={`hidden md:inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(status)}`}
        >
          {formatStatusLabel(status)}
        </span>
      </button>
    );
  };

  return (
    <aside className="w-16 md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300">
      <div className="flex items-center justify-center md:justify-start p-4 h-16 border-b border-slate-200 flex-shrink-0">
        <DnaIcon className="h-8 w-8 text-cyan-500" />
        <h1 className="hidden md:block ml-3 text-xl font-bold text-slate-800">Data Hub</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 py-4 space-y-6">
          <div>
            <h3 className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:block">Actions</h3>
            <div className="space-y-2">
              {ACTION_LINKS.map((link) => renderLink(link.id, link.label, link.icon))}
            </div>
          </div>
          <div>
            <h3 className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:block">Datasets</h3>
            {isLoadingDatasets ? (
              <div className="px-3 py-2 text-xs text-slate-500">Loading datasets…</div>
            ) : datasetLinks.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500">
                No dataset sources registered yet.
              </div>
            ) : (
              <div className="space-y-2">
                {datasetLinks.map((dataset) => renderLink(dataset.id, dataset.label, dataset.icon, dataset.status))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
