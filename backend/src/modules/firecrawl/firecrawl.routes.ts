import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../../utils/http-error.js';

const FIRECRAWL_ENDPOINT = process.env.FIRECRAWL_API_URL ?? 'https://api.firecrawl.dev/v1/scrape';
const REQUEST_TIMEOUT_MS = 20_000;

const querySchema = z.object({
  url: z.string().url(),
  mode: z.enum(['scrape']).optional()
});

export const firecrawlRouter = Router();

firecrawlRouter.get('/', async (req, res, next) => {
  const parsed = querySchema.safeParse(req.query);

  if (!parsed.success) {
    next(new HttpError(400, 'Query parameter "url" must be a valid URL.'));
    return;
  }

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    next(new HttpError(501, 'Firecrawl integration is not configured. Please provide an API key.'));
    return;
  }

  const { url } = parsed.data;

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    next(new HttpError(400, 'The provided URL could not be parsed.'));
    return;
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    next(new HttpError(400, 'Only HTTP(S) URLs are supported.'));
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(FIRECRAWL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        url: target.toString(),
        formats: ['markdown'],
        include_links: true,
        include_metadata: true
      }),
      signal: controller.signal
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        payload && typeof payload.message === 'string'
          ? payload.message
          : `Firecrawl responded with status ${response.status}.`;
      throw new HttpError(response.status, message);
    }

    const data = payload && typeof payload === 'object' ? (payload.data ?? payload) : null;
    const markdown = data && typeof data.markdown === 'string' ? data.markdown : '';
    const metadata = data && typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : null;
    const links = Array.isArray(data?.links) ? data.links : undefined;

    res.json({
      url: target.toString(),
      markdown,
      metadata,
      links,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      next(new HttpError(504, 'Timed out while waiting for Firecrawl to respond.'));
      return;
    }

    next(new HttpError(502, 'Failed to retrieve data from Firecrawl.'));
  } finally {
    clearTimeout(timeout);
  }
});
