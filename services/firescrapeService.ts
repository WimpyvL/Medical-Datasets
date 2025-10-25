import { FireScrapeResult } from '../types';

const buildQuery = (url: string) => new URLSearchParams({ url }).toString();

export const runFireScrape = async (url: string): Promise<FireScrapeResult> => {
  if (!url) {
    throw new Error('Please provide a URL to scrape.');
  }

  const response = await fetch(`/api/firescrape?${buildQuery(url)}`);

  if (!response.ok) {
    let message = 'Failed to scrape the requested URL.';
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

  const data = (await response.json()) as FireScrapeResult;
  return data;
};
