export type DataSource = string;

export const SPECIAL_SOURCE_NAMES = {
  dataIngestion: 'Data Ingestion',
  fireScrapeTool: 'FireScrape Tool',
} as const;

export const ACTION_IDS = {
  dataIngestion: '__action__data_ingestion__',
  fireScrapeTool: '__action__fire_scrape_tool__',
} as const;

export type ActionId = (typeof ACTION_IDS)[keyof typeof ACTION_IDS];

export interface SnapshotMetadata {
  snapshotId?: string;
  source: string;
  timestamp: string;
  status?: IngestionJobStatus;
  checksum?: string | null;
  isFromCache?: boolean;
  recordCount?: number;
  itemCount?: number;
  downloadUrl?: string;
  additionalInfo?: Record<string, unknown>;
}

export interface PaginationTokens {
  nextToken?: string;
  previousToken?: string;
}

export interface SnapshotResponse<T> {
  items: T[];
  snapshot: SnapshotMetadata;
  pagination?: PaginationTokens;
  downloadUrl?: string;
}

export type IngestionLogLevel = 'info' | 'warn' | 'error' | 'debug';

export enum IngestionJobStatus {
  Queued = 'queued',
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
  Unknown = 'unknown',
}

export interface IngestionLogEntry {
  id: string;
  source: string;
  timestamp: string;
  level: IngestionLogLevel;
  message: string;
  status?: IngestionJobStatus;
  jobId?: string;
}

export interface IngestionJobResponse {
  jobId?: string;
  id?: string;
  source?: DataSource | string;
  status?: IngestionJobStatus | string;
  job?: {
    id: string;
    status?: IngestionJobStatus | string;
  };
  snapshot?: SnapshotMetadata;
}

export type ApiErrorType = 'validation' | 'network' | 'server';

export interface ApiErrorBase {
  type: ApiErrorType;
  message: string;
  status?: number;
  details?: unknown;
}

export interface ValidationErrorResponse extends ApiErrorBase {
  type: 'validation';
  fieldErrors?: Record<string, string[]>;
}

export interface NetworkErrorResponse extends ApiErrorBase {
  type: 'network';
  retryable?: boolean;
}

export interface ServerErrorResponse extends ApiErrorBase {
  type: 'server';
}

export type ApiErrorResponse =
  | ValidationErrorResponse
  | NetworkErrorResponse
  | ServerErrorResponse;

export interface FireScrapeResult {
  url: string;
  title: string | null;
  contentType: string;
  text: string;
  truncated: boolean;
  bytesDownloaded: number;
  fetchedAt: string;
}

export interface FireCrawlResult {
  url: string;
  markdown: string;
  metadata: Record<string, unknown> | null;
  links?: unknown[];
  fetchedAt: string;
}

export interface DatasetSnapshotSummary {
  id: string;
  source: string;
  status: string;
  storageLocation: string;
  checksum: string | null;
  metadata: Record<string, unknown>;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface DatasetSourceRecord {
  id: number;
  source: string;
  description: string | null;
  createdAt: string;
  latestSnapshot: DatasetSnapshotSummary | null;
}
