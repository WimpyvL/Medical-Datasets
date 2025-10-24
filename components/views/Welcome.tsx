import React from 'react';
import { DnaIcon } from '../icons/Icons';

const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <DnaIcon className="w-24 h-24 text-cyan-500 mb-6" />
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
        Medical Data Hub
      </h1>
      <p className="max-w-2xl text-lg text-slate-600">
        Your central dashboard for accessing, processing, and understanding complex medical data. Select a data source from the sidebar to begin.
      </p>
    </div>
  );
};

export default Welcome;