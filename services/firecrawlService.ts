import { FireCrawlResult } from '../types';

const buildQuery = (url: string) => new URLSearchParams({ url }).toString();

export const runFireCrawl = async (url: string): Promise<FireCrawlResult> => {
  if (!url) {
    throw new Error('Please provide a URL to crawl.');
  }

  const response = await fetch(`/api/firecrawl?${buildQuery(url)}`);

  if (!response.ok) {
    let message = 'Failed to crawl the requested URL.';
    try {
      const data = await response.json();
      if (data && typeof data.message === 'string') {
        message = data.message;
      }
    } catch {
      // Ignore JSON parse errors and use the default message
    }
    throw new Error(message);
  }

  const data = (await response.json()) as FireCrawlResult;
  return data;
};
