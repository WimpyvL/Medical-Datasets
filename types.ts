export enum DataSource {
  DataIngestion = 'Data Ingestion',
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
