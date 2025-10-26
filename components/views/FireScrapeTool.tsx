import React, { useCallback, useState } from 'react';
import DataSourceCard from '../DataSourceCard';
import { runFireScrape } from '../../services/firescrapeService';
import { runFireCrawl } from '../../services/firecrawlService';
import { FireScrapeResult, FireCrawlResult } from '../../types';
import GeminiSummary from '../GeminiSummary';

type ToolMode = 'firescrape' | 'firecrawl';

type ToolResult =
  | { mode: 'firescrape'; data: FireScrapeResult }
  | { mode: 'firecrawl'; data: FireCrawlResult };

const FireScrapeTool: React.FC = () => {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<ToolMode>('firescrape');
  const [result, setResult] = useState<ToolResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleModeChange = useCallback((nextMode: ToolMode) => {
    setMode(nextMode);
    setResult(null);
    setError(null);
  }, []);

  const handleScrape = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setResult(null);
      setIsLoading(true);
      try {
        const trimmedUrl = url.trim();
        if (mode === 'firecrawl') {
          const data = await runFireCrawl(trimmedUrl);
          setResult({ mode, data });
        } else {
          const data = await runFireScrape(trimmedUrl);
          setResult({ mode, data });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [mode, url]
  );

  const renderFireScrapeResult = (data: FireScrapeResult) => {
    const fetchedAt = new Date(data.fetchedAt);
    const formattedFetchedAt = Number.isNaN(fetchedAt.getTime()) ? data.fetchedAt : fetchedAt.toLocaleString();

    return (
      <div className="mt-6 space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Page Details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
            <div>
              <dt className="font-medium text-slate-700">URL</dt>
              <dd className="break-words">{data.url}</dd>
            </div>
            {data.title && (
              <div>
                <dt className="font-medium text-slate-700">Title</dt>
                <dd>{data.title}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium text-slate-700">Content Type</dt>
              <dd>{data.contentType}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Fetched</dt>
              <dd>{formattedFetchedAt}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Bytes Downloaded</dt>
              <dd>{data.bytesDownloaded.toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-900">Extracted Text</h3>
            {data.truncated && (
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
            {data.text}
          </div>
        </div>

        <GeminiSummary data={data} context={`Web content scraped from ${data.url}`} />
      </div>
    );
  };

  const renderFireCrawlResult = (data: FireCrawlResult) => {
    const fetchedAt = new Date(data.fetchedAt);
    const formattedFetchedAt = Number.isNaN(fetchedAt.getTime()) ? data.fetchedAt : fetchedAt.toLocaleString();
    const metadata = data.metadata ?? null;
    const titleValue = metadata ? metadata['title'] : undefined;
    const descriptionValue = metadata ? metadata['description'] : undefined;
    const title = typeof titleValue === 'string' ? titleValue : null;
    const description = typeof descriptionValue === 'string' ? descriptionValue : null;

    type FirecrawlLink = { url: string; title?: string | null; description?: string | null };
    const safeLinks: FirecrawlLink[] = Array.isArray(data.links)
      ? data.links.filter((link: unknown): link is FirecrawlLink => {
          if (!link || typeof link !== 'object') {
            return false;
          }
          return 'url' in link && typeof (link as { url?: unknown }).url === 'string';
        })
      : [];

    return (
      <div className="mt-6 space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Firecrawl Snapshot</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
            <div>
              <dt className="font-medium text-slate-700">URL</dt>
              <dd className="break-words">{data.url}</dd>
            </div>
            {title && (
              <div>
                <dt className="font-medium text-slate-700">Title</dt>
                <dd>{title}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium text-slate-700">Fetched</dt>
              <dd>{formattedFetchedAt}</dd>
            </div>
            {description && (
              <div className="sm:col-span-2">
                <dt className="font-medium text-slate-700">Description</dt>
                <dd>{description}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Markdown Output</h3>
          <p className="text-sm text-slate-600 mb-3">
            Firecrawl provides a readable markdown representation of the page, with structural cues that are handy for AI
            summarization or turning into datasets.
          </p>
          <div className="max-h-80 overflow-y-auto bg-slate-900/95 text-slate-100 rounded-lg p-4 text-sm whitespace-pre-wrap">
            {data.markdown || 'No markdown content returned.'}
          </div>
        </div>

        {metadata && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Metadata</h3>
            <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        )}

        {safeLinks.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Discovered Links</h3>
            <p className="text-sm text-slate-600 mb-3">
              Use these follow-up URLs to expand the crawl or seed additional research tasks.
            </p>
            <ul className="space-y-2 text-sm text-cyan-900">
              {safeLinks.map((link, index) => (
                <li key={`${link.url}-${index}`} className="break-words">
                  <span className="font-medium text-slate-700">
                    {link.title || link.description || `Link ${index + 1}`}:
                  </span>{' '}
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="underline text-cyan-600">
                    {link.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <GeminiSummary data={data} context={`Firecrawl markdown and metadata for ${data.url}`} />
      </div>
    );
  };

  const renderResult = () => {
    if (!result) {
      return null;
    }

    if (result.mode === 'firecrawl') {
      return renderFireCrawlResult(result.data);
    }

    return renderFireScrapeResult(result.data);
  };

  return (
    <DataSourceCard
      title="FireScrape & Firecrawl Web Tools"
      description={
        <>
          Blend direct page scraping via <strong>FireScrape</strong> with structured crawling powered by <strong>Firecrawl</strong>
          . Choose the approach that fits your research and pull rich context back into the app.
        </>
      }
      ingestion={
        <>
          <p>
            <strong>FireScrape:</strong> Server-side fetch with sanitization that strips scripts/styles, normalizes whitespace,
            and trims overly long responses.
          </p>
          <p>
            <strong>Firecrawl:</strong> Hosted crawler that returns markdown, metadata, and related links. Requests are proxied
            through the backend and require a Firecrawl API key.
          </p>
          <p>Use either path to bootstrap research from articles, docs, or any public knowledge base.</p>
        </>
      }
    >
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 min-h-[340px]">
        <div className="flex items-center justify-start gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleModeChange('firescrape')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === 'firescrape'
                ? 'bg-cyan-500 text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            FireScrape
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('firecrawl')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === 'firecrawl'
                ? 'bg-cyan-500 text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Firecrawl
          </button>
        </div>

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
                {isLoading ? (mode === 'firecrawl' ? 'Crawling…' : 'Scraping…') : mode === 'firecrawl' ? 'Run Firecrawl' : 'Run FireScrape'}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              We only support public HTTP(S) URLs. FireScrape keeps payloads lightweight, while Firecrawl requires a configured
              API key and may return richer metadata.
            </p>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        {isLoading && (
          <div className="mt-6 flex items-center text-slate-600 text-sm">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mr-3"></div>
            {mode === 'firecrawl' ? 'Requesting Firecrawl…' : 'Fetching page content…'}
          </div>
        )}

        {!isLoading && !error && !result && (
          <div className="mt-6 text-sm text-slate-500">
            Enter a URL above to fetch readable page content or a Firecrawl snapshot that you can summarize or add to your
            research notes.
          </div>
        )}

        {renderResult()}
      </div>
    </DataSourceCard>
  );
};

export default FireScrapeTool;
