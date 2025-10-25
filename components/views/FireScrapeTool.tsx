import React, { useCallback, useState } from 'react';
import DataSourceCard from '../DataSourceCard';
import { runFireScrape } from '../../services/firescrapeService';
import { FireScrapeResult } from '../../types';
import GeminiSummary from '../GeminiSummary';

const FireScrapeTool: React.FC = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<FireScrapeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const data = await runFireScrape(url.trim());
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  const renderResult = () => {
    if (!result) {
      return null;
    }

    const fetchedAt = new Date(result.fetchedAt);
    const formattedFetchedAt = Number.isNaN(fetchedAt.getTime())
      ? result.fetchedAt
      : fetchedAt.toLocaleString();

    return (
      <div className="mt-6 space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Page Details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
            <div>
              <dt className="font-medium text-slate-700">URL</dt>
              <dd className="break-words">{result.url}</dd>
            </div>
            {result.title && (
              <div>
                <dt className="font-medium text-slate-700">Title</dt>
                <dd>{result.title}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium text-slate-700">Content Type</dt>
              <dd>{result.contentType}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Fetched</dt>
              <dd>{formattedFetchedAt}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Bytes Downloaded</dt>
              <dd>{result.bytesDownloaded.toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-900">Extracted Text</h3>
            {result.truncated && (
              <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                Truncated for safety
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-3">
            The backend removes scripts and styles, normalizes whitespace, and returns a trimmed text-only
            version of the page suitable for AI processing.
          </p>
          <div className="max-h-80 overflow-y-auto bg-slate-900/95 text-slate-100 rounded-lg p-4 text-sm whitespace-pre-wrap">
            {result.text}
          </div>
        </div>

        <GeminiSummary data={result} context={`Web content scraped from ${result.url}`} />
      </div>
    );
  };

  return (
    <DataSourceCard
      title="FireScrape Web Tool"
      description={
        <>
          <strong>FireScrape</strong> lets you pull down the readable content of any public web page through the
          backend proxy so you can summarize or analyze it with Gemini without running into browser CORS limits.
        </>
      }
      ingestion={
        <>
          <p><strong>Method:</strong> Server-side fetch with sanitization</p>
          <p>
            Requests are proxied through the Express backend, where we enforce timeouts, limit payload size, and
            strip non-text elements before returning normalized text content.
          </p>
          <p>
            Use this tool to bootstrap dataset research from articles, documentation pages, or any resource that
            lacks an official API.
          </p>
        </>
      }
    >
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 min-h-[300px]">
        <form onSubmit={handleScrape} className="space-y-4">
          <div>
            <label htmlFor="firescrape-url" className="block text-sm font-medium text-slate-700 mb-2">
              Page URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="firescrape-url"
                type="url"
                required
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com/article"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Scraping…' : 'Run FireScrape'}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              We only support public HTTP(S) URLs. The scraper trims responses to keep them lightweight for downstream AI use.
            </p>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mt-6 flex items-center text-slate-600 text-sm">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mr-3"></div>
            Fetching page content…
          </div>
        )}

        {!isLoading && !error && !result && (
          <div className="mt-6 text-sm text-slate-500">
            Enter a URL above to fetch readable page content that you can summarize or add to your research notes.
          </div>
        )}

        {renderResult()}
      </div>
    </DataSourceCard>
  );
};

export default FireScrapeTool;
