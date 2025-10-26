export enum DataSource {
  DataIngestion = 'Data Ingestion',
  FireScrapeTool = 'FireScrape Tool',
  DailyMed = 'DailyMed',
  OrangeBook = 'Orange Book',
  CDCGuidelines = 'CDC/NIH Guidelines',
  NIHSafety = 'NIH Drug-Safety',
  StatPearls = 'StatPearls',
  USPSTF = 'USPSTF Recommendations',
  ClinicalTrials = 'ClinicalTrials.gov',
  MedlinePlus = 'MedlinePlus',
  MIMIC_IV = 'MIMIC-IV',
  EICU_CRD = 'eICU-CRD',
  FAERS = 'FAERS',
  CMS_PUF = 'CMS Public Use Files',
  OpenFDA = 'OpenFDA',
  SEER = 'SEER Program',
  NHANES = 'NHANES',
  NPPES = 'NPPES',
  PubMedCentral = 'PubMed Central',
  Synthea = 'Synthea',
  InternationalRegistries = 'International Registries',
  CheXpertSplits = 'SyntheticallyEnhanced: CheXpert',
  MIMICSplits = 'SyntheticallyEnhanced: MIMIC',
  RIDCOVID = 'RID-COVID',
  RJUAQA = 'RJUA-QA',
  DDXPlus = 'DDXPlus Dataset',
  LUNA16 = 'LUNA16',
}

/**
 * Metadata returned alongside dataset snapshots. Aligns with the backend snapshot record shape while
 * keeping optional fields flexible for sources that do not expose certain attributes.
 */
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

/**
 * Cursor-style pagination tokens included with snapshot responses when a backend source supports pagination.
 */
export interface PaginationTokens {
  nextToken?: string;
  previousToken?: string;
}

/**
 * Generic wrapper describing the payload returned from dataset snapshot requests.
 */
export interface SnapshotResponse<T> {
  items: T[];
  snapshot: SnapshotMetadata;
  pagination?: PaginationTokens;
  downloadUrl?: string;
}

/**
 * Log levels surfaced from ingestion jobs. These values are shared across SSE streams and REST fallbacks.
 */
export type IngestionLogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Canonical ingestion job status values used throughout the UI.
 */
export enum IngestionJobStatus {
  Queued = 'queued',
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
  Unknown = 'unknown',
}

/**
 * Structured log entries appended to the ingestion status feed.
 */
export interface IngestionLogEntry {
  id: string;
  source: string;
  timestamp: string;
  level: IngestionLogLevel;
  message: string;
  status?: IngestionJobStatus;
  jobId?: string;
}

/**
 * Minimal ingestion job descriptor returned from the backend when a job is started.
 */
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

export interface DailyMedDrug {
  drug_name: string;
  last_updated: string;
}

export interface OrangeBookProduct {
  Application_Number: string;
  Product_No: string;
  Form: string;
  Strength: string;
  RLD: string;
  TE_Code: string;
  Active_Ing: string;
  Patent_Numbers?: string[];
  Exclusivity_Codes?: string[];
}

export interface Guideline {
  guideline_title: string;
  version_date: string;
  source: string;
  recommendations: {
    section: string;
    statement: string;
    evidence_grade: string;
  }[];
}

export interface NihSafetyRecord {
  source: 'LactMed' | 'LiverTox';
  generic_name: string;
  summary: string;
  alternative_drugs?: string[];
}

export interface StatPearlsChapter {
  book_id: string;
  title: string;
  summary: string;
  references_count: number;
}

export interface UspstfRecommendation {
  screening: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'I';
  rationale: string;
  patient_profile: {
    age: number;
    sex: 'Male' | 'Female';
    tobacco_use: boolean;
  };
}

export interface ClinicalTrial {
  NCTId: string;
  BriefTitle: string;
  OverallStatus: string;
  Condition: string[];
  OutcomeMeasure: string[];
}

export interface MedlinePlusTopic {
  title: string;
  summary: string;
  url: string;
  groups: string[];
  mesh_terms: string[];
}

export interface MimicIvData {
  table_name: string;
  row_count: string;
  description: string;
}

export interface EicuCrdData {
  table_name: string;
  row_count: string;
  description: string;
}

export interface FaersData {
  report_id: string;
  product_name: string;
  reaction: string;
}

export interface CmsPufData {
  file_name: string;
  description: string;
  category: string;
}

export interface OpenFDAEndpoint {
  name: string;
  description: string;
  example_query: string;
}

export interface SeerData {
  cancer_site: string;
  incidence_rate_per_100k: number;
  five_year_survival_rate: string;
}

export interface NhanesData {
  data_cycle: string;
  component: string;
  description: string;
}

export interface NppesData {
  npi: string;
  provider_type: string;
  state: string;
  name: string;
}

export interface PubMedArticle {
  pmcid: string;
  title: string;
  journal: string;
}

export interface SyntheaPatient {
  patient_id: string;
  conditions: string[];
  medications: string[];
}

export interface InternationalRegistry {
  name: string;
  country: string;
  description: string;
}

export interface ChexpertSplit {
  split_type: 'train' | 'validation';
  file_name: string;
  description: string;
}

export interface MimicSplit {
  split_type: 'train' | 'validation';
  file_name: string;
  description: string;
}

export interface RidCovidData {
    dataset_focus: string;
    annotation_type: string;
    modality: string;
    description: string;
}

export interface RjuaQaPair {
    question: string;
    answer: string;
    source: string;
}

export interface DdxPlusRecord {
    record_id: string;
    diagnosis: string;
    symptoms_detected: string[];
    patient_profile: string;
}

export interface Luna16Sample {
    series_uid: string;
    nodule_count: number;
    description: string;
}
