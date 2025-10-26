export enum DatasetSource {
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
  LUNA16 = 'LUNA16'
}

export interface DatasetIngestionContext {
  storageDir: string;
  tempDir: string;
  signal?: AbortSignal;
  logger: DatasetLogger;
}

export interface DatasetLogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export interface DatasetConnectorOutput {
  stream: NodeJS.ReadableStream;
  /** File extension to append to the generated snapshot artifact (e.g. `.jsonl`, `.zip`). */
  fileExtension: string;
  /** Optional mime type of the stored snapshot. */
  contentType?: string;
  /** Additional metadata reported by the connector (counts, time ranges, etc). */
  metadata?: Record<string, unknown>;
  /** Optional approximate item count reported by the connector. */
  itemCount?: number;
}

export interface DatasetSnapshotRecord {
  id: string;
  source: DatasetSource;
  status: 'pending' | 'completed' | 'failed';
  storageLocation: string;
  checksum: string | null;
  metadata: Record<string, unknown>;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface DatasetSourceRecord {
  id: number;
  source: DatasetSource;
  description: string | null;
  createdAt: string;
  latestSnapshot: DatasetSnapshotRecord | null;
}
