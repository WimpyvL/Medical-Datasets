
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { IngestionIcon } from '../icons/Icons';
import { DataSource } from '../../types';
import { apiFetch } from '../../services/apiClient';

type JobStatus =
    | 'queued'
    | 'pending'
    | 'running'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'unknown';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface StatusLog {
    id: string;
    source: string;
    timestamp: string;
    level: LogLevel;
    message: string;
    status?: JobStatus;
}

interface IngestionJobResponse {
    jobId?: string;
    id?: string;
    status?: string;
    job?: {
        id: string;
        status?: string;
    };
}

const excludedSources = new Set<DataSource>([
    DataSource.DataIngestion,
    DataSource.FireScrapeTool,
]);

const allDataSources = (Object.values(DataSource) as DataSource[]).filter(
    (ds) => !excludedSources.has(ds)
);

const normalizeStatus = (status?: string | null): JobStatus => {
    if (!status) {
        return 'unknown';
    }
    const lowered = status.toLowerCase();
    if (['queued', 'queueing'].includes(lowered)) return 'queued';
    if (['pending', 'waiting'].includes(lowered)) return 'pending';
    if (['running', 'in_progress', 'processing', 'started', 'active'].includes(lowered)) return 'running';
    if (['completed', 'success', 'succeeded', 'done', 'finished'].includes(lowered)) return 'completed';
    if (['failed', 'error', 'errored'].includes(lowered)) return 'failed';
    if (['cancelled', 'canceled', 'aborted', 'stopped'].includes(lowered)) return 'cancelled';
    return 'unknown';
};

const normalizeLevel = (level?: string | null): LogLevel => {
    switch ((level ?? '').toLowerCase()) {
        case 'warn':
        case 'warning':
            return 'warn';
        case 'error':
        case 'fatal':
            return 'error';
        case 'debug':
            return 'debug';
        default:
            return 'info';
    }
};

const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return timestamp;
    }
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const isTerminalStatus = (status: JobStatus): boolean => ['completed', 'failed', 'cancelled'].includes(status);

const LogLevelIcon: React.FC<{ level: LogLevel }> = ({ level }) => {
    switch (level) {
        case 'warn':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.518 11.602c.75 1.336-.213 2.999-1.743 2.999H3.482c-1.53 0-2.493-1.663-1.743-2.999L8.257 3.1zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-.293-6.707a1 1 0 00-1.414 0l-.293.293a1 1 0 101.414 1.414l.293-.293a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
            );
        case 'error':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            );
        case 'debug':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 3a1 1 0 00-.707 1.707L10.586 7H7a1 1 0 100 2h6a1 1 0 00.707-1.707L11.414 5H15a1 1 0 100-2H9z" />
                    <path d="M6 12a1 1 0 011-1h10a1 1 0 110 2H7a1 1 0 01-1-1z" />
                    <path d="M9 17a1 1 0 011-1h5a1 1 0 010 2h-5a1 1 0 01-1-1z" />
                </svg>
            );
        default:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884l8-3a1 1 0 01.994 0l8 3A1 1 0 0119 6.764V14a1 1 0 01-.553.894l-8 4a1 1 0 01-.894 0l-8-4A1 1 0 011 14V6.764a1 1 0 011.003-.88z" />
                </svg>
            );
    }
};

const StatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => {
    const normalized = normalizeStatus(status);
    const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold';

    switch (normalized) {
        case 'queued':
        case 'pending':
            return <span className={`${base} bg-slate-100 text-slate-700`}>{normalized}</span>;
        case 'running':
            return <span className={`${base} bg-blue-100 text-blue-700`}>running</span>;
        case 'completed':
            return <span className={`${base} bg-emerald-100 text-emerald-700`}>completed</span>;
        case 'failed':
            return <span className={`${base} bg-rose-100 text-rose-700`}>failed</span>;
        case 'cancelled':
            return <span className={`${base} bg-amber-100 text-amber-700`}>cancelled</span>;
        default:
            return <span className={`${base} bg-slate-100 text-slate-600`}>{status ?? 'unknown'}</span>;
    }
};

const DataIngestionView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [statusLog, setStatusLog] = useState<StatusLog[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeJob, setActiveJob] = useState<{ source: DataSource; status: JobStatus; jobId: string } | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const appendLog = useCallback((entry: StatusLog) => {
        setStatusLog(prev => [...prev, entry]);
    }, []);

    const openIngestionStream = useCallback((jobId: string, source: DataSource, initialStatus: JobStatus): Promise<JobStatus> => {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
                const fallbackTimestamp = new Date().toISOString();
                appendLog({
                    id: `${jobId}-fallback`,
                    source,
                    timestamp: fallbackTimestamp,
                    level: 'warn',
                    message: 'Real-time updates are unavailable in this environment. Polling for job status.',
                    status: initialStatus !== 'unknown' ? initialStatus : undefined,
                });

                // Polling fallback
                let isActive = true;
                const terminalStates: JobStatus[] = ['completed', 'failed', 'cancelled'];
                let lastStatus: JobStatus = initialStatus !== 'unknown' ? initialStatus : 'running';

                const poll = async () => {
                    try {
                        const resp = await apiFetch(`/api/datasets/jobs/${encodeURIComponent(jobId)}/status`);
                        const status: JobStatus = resp?.status || 'unknown';
                        const pollTimestamp = new Date().toISOString();
                        if (status !== lastStatus) {
                            appendLog({
                                id: `${jobId}-poll-${status}-${pollTimestamp}`,
                                source,
                                timestamp: pollTimestamp,
                                level: 'info',
                                message: `Job status updated: ${status}`,
                                status,
                            });
                            lastStatus = status;
                        }
                        if (terminalStates.includes(status)) {
                            isActive = false;
                            resolve(status);
                        } else if (isActive) {
                            setTimeout(poll, 2000);
                        }
                    } catch (err) {
                        const errorTimestamp = new Date().toISOString();
                        appendLog({
                            id: `${jobId}-poll-error-${errorTimestamp}`,
                            source,
                            timestamp: errorTimestamp,
                            level: 'error',
                            message: `Polling error: ${err instanceof Error ? err.message : String(err)}`,
                            status: lastStatus,
                        });
                        // Optionally, you could reject here, or keep polling
                        if (isActive) {
                            setTimeout(poll, 4000);
                        }
                    }
                };

                poll();

                // Cleanup if needed (e.g., on component unmount)
                // Optionally, you could return a cancel function or use a ref to set isActive = false
                return;
            }

            let lastStatus = initialStatus !== 'unknown' ? initialStatus : 'running';
            const streamUrl = `/api/datasets/jobs/${encodeURIComponent(jobId)}/events`;
            const eventSource = new EventSource(streamUrl);
            eventSourceRef.current = eventSource;
            let settled = false;

            const complete = (status: JobStatus) => {
                if (settled) {
                    return;
                }
                settled = true;
                lastStatus = status;
                eventSource.close();
                if (eventSourceRef.current === eventSource) {
                    eventSourceRef.current = null;
                }
                resolve(status);
            };

            const handleEvent = (rawEvent: MessageEvent<string> | Event) => {
                const event = rawEvent as MessageEvent<string>;
                const rawData = event.data ?? '';
                let payload: Record<string, unknown> = {};

                if (rawData) {
                    try {
                        payload = JSON.parse(rawData) as Record<string, unknown>;
                    } catch {
                        payload = { message: rawData };
                    }
                }

                const payloadStatus = normalizeStatus(
                    (payload.status as string | undefined) ??
                    (payload.state as string | undefined) ??
                    (payload.phase as string | undefined)
                );

                const level = normalizeLevel((payload.level as string | undefined) ?? (payload.severity as string | undefined));
                const timestamp = typeof payload.timestamp === 'string' ? payload.timestamp : new Date().toISOString();
                const message =
                    typeof payload.message === 'string'
                        ? payload.message
                        : typeof payload.detail === 'string'
                            ? payload.detail
                            : typeof payload.description === 'string'
                                ? payload.description
                                : rawData || `${event.type} event received`;

                const entry: StatusLog = {
                    id: (payload.id as string | undefined) ?? `${jobId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    source: (payload.source as string | undefined) ?? source,
                    timestamp,
                    level,
                    message,
                    status: payloadStatus !== 'unknown' ? payloadStatus : undefined,
                };

                appendLog(entry);

                if (payloadStatus !== 'unknown') {
                    lastStatus = payloadStatus;
                    setActiveJob(current => (current && current.jobId === jobId ? { ...current, status: lastStatus } : current));
                    if (isTerminalStatus(payloadStatus)) {
                        complete(payloadStatus);
                    }
                } else if (
                    (payload.final as boolean | undefined) === true ||
                    ['complete', 'completed', 'end'].includes((payload.type as string | undefined)?.toLowerCase() ?? '')
                ) {
                    complete(lastStatus);
                }
            };

            const listener = (event: Event) => handleEvent(event as MessageEvent<string>);

            eventSource.addEventListener('message', listener);
            eventSource.addEventListener('log', listener);
            eventSource.addEventListener('status', listener);
            eventSource.addEventListener('progress', listener);
            eventSource.addEventListener('complete', listener);

            eventSource.onerror = () => {
                if (settled) {
                    return;
                }
                settled = true;
                eventSource.close();
                if (eventSourceRef.current === eventSource) {
                    eventSourceRef.current = null;
                }
                reject(new Error('Connection to the ingestion stream was interrupted.'));
            };
        });
    }, [appendLog]);

    const handleStartIngestion = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);
        setStatusLog([]);

        try {
            for (const source of allDataSources) {
                const response = await apiFetch<IngestionJobResponse>(
                    `/api/datasets/${encodeURIComponent(source)}/ingest`,
                    { method: 'POST' }
                );

                const jobId = response?.jobId ?? response?.id ?? response?.job?.id;
                if (!jobId) {
                    throw new Error(`The ingestion response for ${source} did not include a job identifier.`);
                }

                const initialStatus = normalizeStatus(response?.status ?? response?.job?.status ?? 'running');
                setActiveJob({ source, status: initialStatus, jobId });

                const finalStatus = await openIngestionStream(jobId, source, initialStatus);

                if (finalStatus !== 'completed') {
                    throw new Error(`Ingestion for ${source} ended with status: ${finalStatus}.`);
                }
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred while starting the ingestion jobs.';
            setErrorMessage(message);
        } finally {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            setActiveJob(null);
            setIsLoading(false);
        }

    }, [openIngestionStream]);

    const buttonLabel = isLoading ? 'Ingestion in progress…' : statusLog.length > 0 ? 'Run Again' : 'Start Ingestion';

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                            <IngestionIcon className="w-8 h-8 mr-3 text-cyan-500" />
                            Data Ingestion
                        </h1>
                        <button
                            onClick={handleStartIngestion}
                            disabled={isLoading}
                            className={`inline-flex items-center justify-center rounded-lg px-6 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 ${
                                isLoading
                                    ? 'bg-cyan-300 text-white cursor-not-allowed'
                                    : 'bg-cyan-500 text-white hover:bg-cyan-600'
                            }`}
                        >
                            {isLoading && (
                                <svg
                                    className="-ml-1 mr-2 h-4 w-4 animate-spin"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                            )}
                            {buttonLabel}
                        </button>
                    </div>
                    <p className="text-slate-600">
                        Trigger a backend ingestion job for every available data source. Progress updates stream in real time as the API connects to each system and archives the resulting snapshots.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 space-y-4">
                {errorMessage && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        <p className="font-semibold">Ingestion encountered an error</p>
                        <p className="mt-1">{errorMessage}</p>
                        <p className="mt-2 text-rose-600">Resolve the issue and click “Run Again” to retry the pipeline.</p>
                    </div>
                )}

                {activeJob && (
                    <div className="flex flex-col gap-1 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                        <div className="flex items-center gap-3">
                            <span className="font-medium">Currently ingesting:</span>
                            <span className="font-semibold">{activeJob.source}</span>
                            <StatusBadge status={activeJob.status} />
                        </div>
                        <span className="text-xs text-blue-700 break-all">Job ID: {activeJob.jobId}</span>
                    </div>
                )}

                <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Ingestion Log</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto bg-slate-50 p-4 rounded-lg border border-slate-200">
                        {statusLog.length === 0 ? (
                            <div className="text-center text-sm text-slate-500 py-6">
                                {isLoading
                                    ? 'Waiting for the first status update from the ingestion service…'
                                    : 'Click “Start Ingestion” to fetch the latest snapshots.'}
                            </div>
                        ) : (
                            statusLog.map((log) => (
                                <div key={log.id} className="flex items-start justify-between gap-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <LogLevelIcon level={log.level} />
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                <span className="font-mono">{formatTimestamp(log.timestamp)}</span>
                                                <span className="text-slate-600 font-semibold">{log.source}</span>
                                            </div>
                                            <p className="text-slate-700 mt-1">{log.message}</p>
                                        </div>
                                    </div>
                                    {log.status && <StatusBadge status={log.status} />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataIngestionView;