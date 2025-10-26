import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import { DatasetConnectorOutput, DatasetIngestionContext, DatasetSource } from '../dataset.types.js';

export abstract class DatasetConnector {
  constructor(public readonly source: DatasetSource) {}

  /**
   * Prepare the download stream for the dataset. Implementations should stream the raw payload without
   * loading everything into memory.
   */
  abstract prepare(context: DatasetIngestionContext): Promise<DatasetConnectorOutput>;

  protected createJsonStream(payload: unknown): Readable {
    return Readable.from([JSON.stringify(payload, null, 2)]);
  }
}

export interface RestPagerConfig {
  /** Base URL of the upstream API. */
  baseUrl: string;
  /** Path appended to the base URL for listing resources. */
  resourcePath: string;
  /** Query parameter used for pagination cursor (e.g. `page`). */
  pageParam: string;
  /** Optional query parameter for page size. */
  pageSizeParam?: string;
  /** Default page size when requesting data. */
  defaultPageSize?: number;
  /** Optional API key header. */
  apiKeyHeader?: string;
  /** Optional API key value. */
  apiKey?: string;
  /** Additional query parameters appended to every request. */
  staticParams?: Record<string, string | number>;
}

export abstract class RestPagerConnector extends DatasetConnector {
  constructor(source: DatasetSource, private readonly config: RestPagerConfig) {
    super(source);
  }

  protected buildHeaders(): Record<string, string> {
    if (this.config.apiKey && this.config.apiKeyHeader) {
      return { [this.config.apiKeyHeader]: this.config.apiKey };
    }
    return {};
  }

  protected buildUrl(page: number): URL {
    const url = new URL(this.config.resourcePath, this.config.baseUrl.endsWith('/') ? this.config.baseUrl : `${this.config.baseUrl}/`);
    url.searchParams.set(this.config.pageParam, String(page));
    if (this.config.pageSizeParam && this.config.defaultPageSize) {
      url.searchParams.set(this.config.pageSizeParam, String(this.config.defaultPageSize));
    }
    if (this.config.staticParams) {
      for (const [key, value] of Object.entries(this.config.staticParams)) {
        url.searchParams.set(key, String(value));
      }
    }
    return url;
  }

  protected abstract parseItems(response: unknown): unknown[];

  async prepare(context: DatasetIngestionContext): Promise<DatasetConnectorOutput> {
    let page = 1;
    let itemCount = 0;

    const generator = async function* (self: RestPagerConnector) {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const url = self.buildUrl(page);
        context.logger.info('Requesting page', { source: self.source, page, url: url.toString() });
        const response = await fetch(url, {
          headers: self.buildHeaders(),
          signal: context.signal
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${self.source} page ${page}: ${response.status} ${response.statusText}`);
        }

        const body = await response.json();
        const pageItems = self.parseItems(body);
        if (pageItems.length === 0) {
          break;
        }

        for (const item of pageItems) {
          itemCount += 1;
          yield `${JSON.stringify(item)}\n`;
        }

        if (!self.hasMore(body, pageItems)) {
          break;
        }
        page += 1;
      }
    };

    const stream = Readable.from(generator(this));
    return {
      stream,
      fileExtension: '.jsonl',
      contentType: 'application/jsonl'
    };
  }

  protected hasMore(response: unknown, pageItems: unknown[]): boolean {
    return pageItems.length > 0;
  }
}

export interface FileDownloadConfig {
  downloadUrl: string;
  apiKeyHeader?: string;
  apiKey?: string;
}

export abstract class FileDownloadConnector extends DatasetConnector {
  constructor(source: DatasetSource, private readonly config: FileDownloadConfig) {
    super(source);
  }

  async prepare(context: DatasetIngestionContext): Promise<DatasetConnectorOutput> {
    context.logger.info('Downloading dataset', { source: this.source, url: this.config.downloadUrl });
    const response = await fetch(this.config.downloadUrl, {
      headers: this.config.apiKey && this.config.apiKeyHeader ? { [this.config.apiKeyHeader]: this.config.apiKey } : undefined,
      signal: context.signal
    });

    if (!response.ok || !response.body) {
      throw new Error(`Failed to download ${this.source}: ${response.status} ${response.statusText}`);
    }

    const rawBody = response.body as unknown;
    const nodeStream =
      rawBody && typeof (rawBody as ReadableStream<Uint8Array>).getReader === 'function'
        ? Readable.fromWeb(rawBody as WebReadableStream<Uint8Array>)
        : (rawBody as NodeJS.ReadableStream);

    return {
      stream: nodeStream,
      fileExtension: this.getFileExtension(response),
      contentType: response.headers.get('content-type') ?? undefined,
      metadata: this.getMetadata(response)
    };
  }

  protected abstract getFileExtension(response: Response): string;
  protected getMetadata(_response: Response): Record<string, unknown> | undefined {
    return undefined;
  }
}

export abstract class StaticDatasetConnector extends DatasetConnector {
  constructor(source: DatasetSource, private readonly payload: unknown) {
    super(source);
  }

  async prepare(_context: DatasetIngestionContext): Promise<DatasetConnectorOutput> {
    return {
      stream: this.createJsonStream(this.payload),
      fileExtension: '.json',
      contentType: 'application/json',
      metadata: Array.isArray(this.payload) ? { itemCount: this.payload.length } : undefined,
      itemCount: Array.isArray(this.payload) ? this.payload.length : undefined
    };
  }
}
