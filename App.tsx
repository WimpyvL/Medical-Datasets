import React, { useState } from 'react';
import { DataSource } from './types';
import Sidebar from './components/Sidebar';
import DailyMed from './components/views/DailyMed';
import OrangeBook from './components/views/OrangeBook';
import CDCGuidelines from './components/views/CDCGuidelines';
import NIHSafety from './components/views/NIHSafety';
import StatPearls from './components/views/StatPearls';
import USPSTF from './components/views/USPSTF';
import ClinicalTrials from './components/views/ClinicalTrials';
import MedlinePlus from './components/views/MedlinePlus';
import Welcome from './components/views/Welcome';
import MIMICIV from './components/views/MIMICIV';
import EICUCRD from './components/views/EICUCRD';
import FAERS from './components/views/FAERS';
import CMSPUF from './components/views/CMSPUF';
import OpenFDA from './components/views/OpenFDA';
import SEER from './components/views/SEER';
import NHANES from './components/views/NHANES';
import NPPES from './components/views/NPPES';
import PubMedCentral from './components/views/PubMedCentral';
import Synthea from './components/views/Synthea';
import InternationalRegistries from './components/views/InternationalRegistries';
import DataIngestionView from './components/views/DataIngestionView';
import FireScrapeTool from './components/views/FireScrapeTool';
import CheXpertSplits from './components/views/CheXpertSplits';
import MIMICSplits from './components/views/MIMICSplits';
import RIDCOVID from './components/views/RIDCOVID';
import RJUAQA from './components/views/RJUAQA';
import DDXPlus from './components/views/DDXPlus';
import LUNA16 from './components/views/LUNA16';


const App: React.FC = () => {
  const [activeSource, setActiveSource] = useState<DataSource | null>(null);

  const renderContent = () => {
    if (!activeSource) {
      return <Welcome />;
    }
    switch (activeSource) {
      case DataSource.DataIngestion:
        return <DataIngestionView />;
      case DataSource.FireScrapeTool:
        return <FireScrapeTool />;
      case DataSource.DailyMed:
        return <DailyMed />;
      case DataSource.OrangeBook:
        return <OrangeBook />;
      case DataSource.CDCGuidelines:
        return <CDCGuidelines />;
      case DataSource.NIHSafety:
        return <NIHSafety />;
      case DataSource.StatPearls:
        return <StatPearls />;
      case DataSource.USPSTF:
        return <USPSTF />;
      case DataSource.ClinicalTrials:
        return <ClinicalTrials />;
      case DataSource.MedlinePlus:
        return <MedlinePlus />;
      case DataSource.MIMIC_IV:
        return <MIMICIV />;
      case DataSource.EICU_CRD:
        return <EICUCRD />;
      case DataSource.FAERS:
        return <FAERS />;
      case DataSource.CMS_PUF:
        return <CMSPUF />;
      case DataSource.OpenFDA:
        return <OpenFDA />;
      case DataSource.SEER:
        return <SEER />;
      case DataSource.NHANES:
        return <NHANES />;
      case DataSource.NPPES:
        return <NPPES />;
      case DataSource.PubMedCentral:
        return <PubMedCentral />;
      case DataSource.Synthea:
        return <Synthea />;
      case DataSource.InternationalRegistries:
        return <InternationalRegistries />;
      case DataSource.CheXpertSplits:
        return <CheXpertSplits />;
      case DataSource.MIMICSplits:
        return <MIMICSplits />;
      case DataSource.RIDCOVID:
        return <RIDCOVID />;
      case DataSource.RJUAQA:
        return <RJUAQA />;
      case DataSource.DDXPlus:
        return <DDXPlus />;
      case DataSource.LUNA16:
        return <LUNA16 />;
      default:
        return <Welcome />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">
      <Sidebar activeSource={activeSource} setActiveSource={setActiveSource} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;