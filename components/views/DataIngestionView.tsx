
import React, { useState, useCallback } from 'react';
import { IngestionIcon } from '../icons/Icons';
import { DataSource } from '../../types';

interface StatusLog {
    source: string;
    message: string;
    status: 'pending' | 'success' | 'error';
}

const excludedSources = new Set<DataSource>([
    DataSource.DataIngestion,
    DataSource.FireScrapeTool,
]);

const allDataSources = (Object.values(DataSource) as DataSource[]).filter(
    (ds) => !excludedSources.has(ds)
);

const DataIngestionView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [statusLog, setStatusLog] = useState<StatusLog[]>([]);

    const runIngestionSimulation = useCallback(async () => {
        for (const source of allDataSources) {
            const willSucceed = Math.random() > 0.1; // 90% success rate
            setStatusLog(prev => [...prev, { source, message: `Connecting to ${source}...`, status: 'pending' }]);
            await new Promise(res => setTimeout(res, 200));

            if (willSucceed) {
                setStatusLog(prev => prev.map(s => s.source === source ? { ...s, message: `Processing ${source} data...` } : s));
                await new Promise(res => setTimeout(res, 300));
                setStatusLog(prev => prev.map(s => s.source === source ? { ...s, message: `Successfully ingested ${source}.`, status: 'success' } : s));
            } else {
                setStatusLog(prev => prev.map(s => s.source === source ? { ...s, message: `Failed to connect to ${source}.`, status: 'error' } : s));
            }
            await new Promise(res => setTimeout(res, 100));
        }
    }, []);

    const handleStartIngestion = useCallback(async () => {
        setIsLoading(true);
        setStatusLog([]);
        await runIngestionSimulation();
        setIsLoading(false);

    }, [runIngestionSimulation]);

    const StatusIcon = ({ status }: { status: 'pending' | 'success' | 'error' }) => {
        switch (status) {
            case 'success': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
            case 'error': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
            default: return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8v0a8 8 0 018 8v0a8 8 0 01-8 8v0a8 8 0 01-8-8v0z" /></svg>;
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                        <IngestionIcon className="w-8 h-8 mr-3 text-cyan-500" />
                        Data Ingestion
                    </h1>
                </div>
                <p className="text-slate-600">
                    This tool simulates a process to connect to all available data sources, check their status, and prepare them for analysis. Click the button to begin the process.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                {!isLoading && statusLog.length === 0 && (
                    <div className="text-center py-8">
                        <button
                            onClick={handleStartIngestion}
                            className="px-8 py-3 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-colors"
                        >
                            Start Ingestion
                        </button>
                    </div>
                )}
                
                {statusLog.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Ingestion Log</h2>
                        <div className="space-y-2 max-h-80 overflow-y-auto bg-slate-50 p-4 rounded-lg border">
                            {statusLog.map((log, index) => (
                                <div key={index} className="flex items-center text-sm">
                                    <StatusIcon status={log.status} />
                                    <span className="ml-3 text-slate-700">{log.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataIngestionView;