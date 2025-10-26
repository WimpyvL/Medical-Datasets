import React, { useState, useCallback } from 'react';
import { summarizeWithGemini } from '../services/geminiService';
import { DnaIcon } from './icons/Icons';

interface GeminiSummaryProps {
  data: unknown;
  context: string;
}

const GeminiSummary: React.FC<GeminiSummaryProps> = ({ data, context }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = useCallback(async () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        setError('No data available to summarize.');
        return;
    }
    setIsLoading(true);
    setError('');
    setSummary('');
    try {
      const result = await summarizeWithGemini(data, context);
      // Basic markdown-to-html-like conversion
      const formattedResult = result
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');
      setSummary(formattedResult);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [data, context]);

  return (
    <div className="mt-6 p-4 bg-slate-100 rounded-lg border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
        <DnaIcon className="w-5 h-5 mr-2 text-cyan-500" />
        AI-Powered Summary
      </h3>
      
      {!summary && !isLoading && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <p className="text-sm text-slate-600 flex-grow">
            Click the button to generate an intelligent summary of the fetched data using Gemini.
          </p>
          <button
            onClick={handleSummarize}
            disabled={isLoading || !data || (Array.isArray(data) && data.length === 0)}
            className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200 w-full sm:w-auto"
          >
            Summarize with Gemini
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <p className="ml-3 text-slate-600">Gemini is thinking...</p>
        </div>
      )}
      
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {summary && (
        <div className="prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: summary }} />
      )}
    </div>
  );
};

export default GeminiSummary;