import {
  DailyMedDrug,
  OrangeBookProduct,
  Guideline,
  NihSafetyRecord,
  StatPearlsChapter,
  UspstfRecommendation,
  ClinicalTrial,
  MedlinePlusTopic,
  MimicIvData,
  EicuCrdData,
  FaersData,
  CmsPufData,
  OpenFDAEndpoint,
  SeerData,
  NhanesData,
  NppesData,
  PubMedArticle,
  SyntheaPatient,
  InternationalRegistry,
  ChexpertSplit,
  MimicSplit,
  RidCovidData,
  RjuaQaPair,
  DdxPlusRecord,
  Luna16Sample,
  SnapshotResponse,
} from '../types';
import { apiFetch } from './apiClient';

type QueryParams = Record<string, string | number | boolean | undefined>;

interface DatasetFetchOptions {
  paginationToken?: string;
  params?: QueryParams;
}

const buildDatasetUrl = (source: string, options: DatasetFetchOptions = {}): string => {
  const searchParams = new URLSearchParams();

  if (options.paginationToken) {
    searchParams.set('pageToken', options.paginationToken);
  }

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });
  }

  const query = searchParams.toString();
  return `/api/datasets/${source}/latest${query ? `?${query}` : ''}`;
};

const fetchDatasetSnapshot = async <T>(
  source: string,
  options: DatasetFetchOptions = {},
): Promise<SnapshotResponse<T>> => {
  const url = buildDatasetUrl(source, options);
  return apiFetch<SnapshotResponse<T>>(url);
};

const createDatasetFetcher = <T>(source: string) => (paginationToken?: string) =>
  fetchDatasetSnapshot<T>(source, paginationToken ? { paginationToken } : {});

export const fetchDailyMedData = createDatasetFetcher<DailyMedDrug>('dailymed');
export const fetchDailyMedDataPage = (paginationToken: string) => fetchDailyMedData(paginationToken);

export const fetchOrangeBookData = createDatasetFetcher<OrangeBookProduct>('orange-book');
export const fetchOrangeBookDataPage = (paginationToken: string) => fetchOrangeBookData(paginationToken);

export const fetchGuidelineData = createDatasetFetcher<Guideline>('guidelines');
export const fetchGuidelineDataPage = (paginationToken: string) => fetchGuidelineData(paginationToken);

export const fetchNihSafetyData = createDatasetFetcher<NihSafetyRecord>('nih-safety');
export const fetchNihSafetyDataPage = (paginationToken: string) => fetchNihSafetyData(paginationToken);

export const fetchStatPearlsData = createDatasetFetcher<StatPearlsChapter>('statpearls');
export const fetchStatPearlsDataPage = (paginationToken: string) => fetchStatPearlsData(paginationToken);

export const fetchUspstfData = (
  age: number,
  sex: 'Male' | 'Female',
  tobacco_use: boolean,
  paginationToken?: string,
): Promise<SnapshotResponse<UspstfRecommendation>> =>
  fetchDatasetSnapshot<UspstfRecommendation>('uspstf', {
    paginationToken,
    params: { age, sex, tobacco_use },
  });

export const fetchUspstfDataPage = (
  paginationToken: string,
  age: number,
  sex: 'Male' | 'Female',
  tobacco_use: boolean,
): Promise<SnapshotResponse<UspstfRecommendation>> =>
  fetchUspstfData(age, sex, tobacco_use, paginationToken);

export const fetchClinicalTrialsData = createDatasetFetcher<ClinicalTrial>('clinical-trials');
export const fetchClinicalTrialsDataPage = (paginationToken: string) => fetchClinicalTrialsData(paginationToken);

export const fetchMedlinePlusData = createDatasetFetcher<MedlinePlusTopic>('medlineplus');
export const fetchMedlinePlusDataPage = (paginationToken: string) => fetchMedlinePlusData(paginationToken);

export const fetchMimicIvData = createDatasetFetcher<MimicIvData>('mimic-iv');
export const fetchMimicIvDataPage = (paginationToken: string) => fetchMimicIvData(paginationToken);

export const fetchEicuCrdData = createDatasetFetcher<EicuCrdData>('eicu-crd');
export const fetchEicuCrdDataPage = (paginationToken: string) => fetchEicuCrdData(paginationToken);

export const fetchFaersData = createDatasetFetcher<FaersData>('faers');
export const fetchFaersDataPage = (paginationToken: string) => fetchFaersData(paginationToken);

export const fetchCmsPufData = createDatasetFetcher<CmsPufData>('cms-puf');
export const fetchCmsPufDataPage = (paginationToken: string) => fetchCmsPufData(paginationToken);

export const fetchOpenFDAData = createDatasetFetcher<OpenFDAEndpoint>('openfda');
export const fetchOpenFDADataPage = (paginationToken: string) => fetchOpenFDAData(paginationToken);

export const fetchSeerData = createDatasetFetcher<SeerData>('seer');
export const fetchSeerDataPage = (paginationToken: string) => fetchSeerData(paginationToken);

export const fetchNhanesData = createDatasetFetcher<NhanesData>('nhanes');
export const fetchNhanesDataPage = (paginationToken: string) => fetchNhanesData(paginationToken);

export const fetchNppesData = createDatasetFetcher<NppesData>('nppes');
export const fetchNppesDataPage = (paginationToken: string) => fetchNppesData(paginationToken);

export const fetchPubMedCentralData = createDatasetFetcher<PubMedArticle>('pubmed-central');
export const fetchPubMedCentralDataPage = (paginationToken: string) => fetchPubMedCentralData(paginationToken);

export const fetchSyntheaData = createDatasetFetcher<SyntheaPatient>('synthea');
export const fetchSyntheaDataPage = (paginationToken: string) => fetchSyntheaData(paginationToken);

export const fetchInternationalRegistriesData = createDatasetFetcher<InternationalRegistry>('international-registries');
export const fetchInternationalRegistriesDataPage = (paginationToken: string) =>
  fetchInternationalRegistriesData(paginationToken);

export const fetchChexpertSplitsData = createDatasetFetcher<ChexpertSplit>('chexpert-splits');
export const fetchChexpertSplitsDataPage = (paginationToken: string) => fetchChexpertSplitsData(paginationToken);

export const fetchMimicSplitsData = createDatasetFetcher<MimicSplit>('mimic-splits');
export const fetchMimicSplitsDataPage = (paginationToken: string) => fetchMimicSplitsData(paginationToken);

export const fetchRidCovidData = createDatasetFetcher<RidCovidData>('rid-covid');
export const fetchRidCovidDataPage = (paginationToken: string) => fetchRidCovidData(paginationToken);

export const fetchRjuaQaData = createDatasetFetcher<RjuaQaPair>('rjua-qa');
export const fetchRjuaQaDataPage = (paginationToken: string) => fetchRjuaQaData(paginationToken);

export const fetchDdxPlusData = createDatasetFetcher<DdxPlusRecord>('ddxplus');
export const fetchDdxPlusDataPage = (paginationToken: string) => fetchDdxPlusData(paginationToken);

export const fetchLuna16Data = createDatasetFetcher<Luna16Sample>('luna16');
export const fetchLuna16DataPage = (paginationToken: string) => fetchLuna16Data(paginationToken);
