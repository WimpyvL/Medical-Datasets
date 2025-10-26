import React, { useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import DataIngestionView from './components/views/DataIngestionView';
import FireScrapeTool from './components/views/FireScrapeTool';
import Welcome from './components/views/Welcome';
import DatasetSnapshotView from './components/views/DatasetSnapshotView';
import { ACTION_IDS } from './types';
import { useDatasetSources } from './components/hooks/useDatasetSources';

const App: React.FC = () => {
  const { datasets, isLoading, error, refresh, refreshSnapshot } = useDatasetSources();
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeDataset = useMemo(
    () => datasets.find((dataset) => dataset.source === activeId),
    [datasets, activeId],
  );

  const renderContent = () => {
    if (activeId === ACTION_IDS.dataIngestion) {
      return (
        <DataIngestionView
          datasets={datasets}
          isLoadingSources={isLoading}
          onRefreshSources={refresh}
        />
      );
    }

    if (activeId === ACTION_IDS.fireScrapeTool) {
      return <FireScrapeTool />;
    }

    if (activeDataset) {
      return (
        <DatasetSnapshotView
          dataset={activeDataset}
          onRefreshSnapshot={refreshSnapshot}
        />
      );
    }

    if (error) {
      return (
        <div className="bg-white border border-rose-200 rounded-lg p-6 text-rose-700">
          <h2 className="text-lg font-semibold mb-2">Unable to load dataset sources</h2>
          <p>{error}</p>
        </div>
      );
    }

    return <Welcome />;
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">
      <Sidebar
        activeId={activeId}
        onSelect={setActiveId}
        datasets={datasets}
        isLoadingDatasets={isLoading}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
