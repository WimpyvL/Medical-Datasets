import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../../utils/http-error.js';

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_BYTES = 500_000;
const MAX_TEXT_LENGTH = 20_000;

const querySchema = z.object({
  url: z.string().url()
});

export const firescrapeRouter = Router();

firescrapeRouter.get('/', async (req, res, next) => {
  const parsed = querySchema.safeParse(req.query);

  if (!parsed.success) {
    next(new HttpError(400, 'Query parameter "url" must be a valid URL.'));
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
    const response = await fetch(target, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MedicalDataHub/1.0 (+https://ai.studio/apps/drive/1ZtHsvIJbHq0s1A-DMwP7aZlFqhNuO7yg)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7'
      }
    });

    if (!response.ok) {
      throw new HttpError(502, `Upstream responded with status ${response.status}`);
    }

    const contentLengthHeader = response.headers.get('content-length');
    if (contentLengthHeader) {
      const reportedLength = Number.parseInt(contentLengthHeader, 10);
      if (Number.isFinite(reportedLength) && reportedLength > MAX_BYTES) {
        throw new HttpError(413, 'Remote content is larger than the allowed limit.');
      }
    }

    const contentType = response.headers.get('content-type') ?? 'text/plain';
    if (!/text|json|xml/i.test(contentType)) {
      throw new HttpError(415, `Unsupported content type: ${contentType}`);
    }

    const raw = await response.text();
    const bytesDownloaded = Buffer.byteLength(raw, 'utf8');

    let sanitized = raw
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');

    sanitized = sanitized.replace(/<[^>]+>/g, ' ');
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    const truncated = sanitized.length > MAX_TEXT_LENGTH || bytesDownloaded > MAX_BYTES;
    const text = truncated ? sanitized.slice(0, MAX_TEXT_LENGTH) : sanitized;

    const titleMatch = raw.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    res.json({
      url: target.toString(),
      title,
      contentType,
      text,
      truncated,
      bytesDownloaded,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      next(new HttpError(504, 'Timed out while fetching the remote page.'));
      return;
    }

    next(new HttpError(502, 'Failed to fetch the requested page.'));
  } finally {
    clearTimeout(timeout);
  }
});
