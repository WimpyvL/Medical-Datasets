import { DatasetSource } from '../dataset.types.js';
import { datasetConfig } from '../dataset.config.js';
import { DatasetConnector } from './base.js';
import { RestPagerConnector } from './base.js';
import { ZipTsvConnector } from './zip-tsv.connector.js';
import { FileDownloadConnector } from './base.js';
import { StaticDatasetConnector } from './base.js';

type FetchResponse = globalThis.Response;

class DailyMedConnector extends RestPagerConnector {
  constructor() {
    super(DatasetSource.DailyMed, {
      baseUrl: datasetConfig.getSourceBaseUrl('dailymed', 'https://dailymed.nlm.nih.gov/dailymed/services/v2/'),
      resourcePath: 'drugnames.json',
      pageParam: 'page',
      pageSizeParam: 'pagesize',
      defaultPageSize: 100
    });
  }

  protected parseItems(response: any): unknown[] {
    return response?.data?.drug?.map((item: any) => ({
      name: item?.drug_name,
      setId: item?.setid,
      updated: item?.last_updated
    })) ?? [];
  }

  protected override hasMore(response: any): boolean {
    const pageCount = response?.metadata?.total_pages;
    const current = response?.metadata?.current_page;
    if (typeof pageCount === 'number' && typeof current === 'number') {
      return current < pageCount;
    }
    return super.hasMore(response, []);
  }
}

class ClinicalTrialsConnector extends RestPagerConnector {
  constructor() {
    super(DatasetSource.ClinicalTrials, {
      baseUrl: datasetConfig.getSourceBaseUrl('clinicaltrials', 'https://clinicaltrials.gov/api/'),
      resourcePath: 'query/full_studies',
      pageParam: 'page',
      pageSizeParam: 'pageSize',
      defaultPageSize: 50,
      staticParams: { expr: 'AREA[LocationCountry]"United States"' }
    });
  }

  protected parseItems(response: any): unknown[] {
    const studies = response?.FullStudiesResponse?.FullStudies ?? [];
    return studies.map((study: any) => ({
      nctId: study?.Study?.ProtocolSection?.IdentificationModule?.NCTId,
      title: study?.Study?.ProtocolSection?.IdentificationModule?.OfficialTitle ?? study?.Study?.ProtocolSection?.IdentificationModule?.BriefTitle,
      status: study?.Study?.ProtocolSection?.StatusModule?.OverallStatus,
      conditions: study?.Study?.ProtocolSection?.ConditionsModule?.ConditionList?.Condition ?? []
    }));
  }

  protected override hasMore(response: any): boolean {
    const total = Number(response?.FullStudiesResponse?.NStudiesFound ?? 0);
    const pageSize = Number(response?.FullStudiesResponse?.NStudiesReturned ?? 0);
    const start = Number(response?.FullStudiesResponse?.MinRank ?? 0);
    return start + pageSize <= total;
  }
}

class OrangeBookConnector extends ZipTsvConnector {
  constructor() {
    super(DatasetSource.OrangeBook, {
      downloadUrl: datasetConfig.getSourceDownloadUrl(
        'orangebook',
        'https://download.fda.gov/drugsatfda_docs/OrangeBook/zip/Products.zip'
      ),
      delimiter: '\t'
    });
  }
}

class OpenFdaConnector extends RestPagerConnector {
  constructor() {
    super(DatasetSource.OpenFDA, {
      baseUrl: datasetConfig.getSourceBaseUrl('openfda', 'https://api.fda.gov/'),
      resourcePath: 'drug/event.json',
      pageParam: 'skip',
      pageSizeParam: 'limit',
      defaultPageSize: 100,
      apiKey: datasetConfig.getSourceApiKey('openfda'),
      apiKeyHeader: 'X-API-KEY'
    });
  }

  protected parseItems(response: any): unknown[] {
    return response?.results ?? [];
  }

  protected override hasMore(response: any): boolean {
    const total = response?.meta?.results?.total ?? 0;
    const skip = response?.meta?.results?.skip ?? 0;
    const limit = response?.meta?.results?.limit ?? 0;
    return skip + limit < total;
  }
}

class FaersConnector extends RestPagerConnector {
  constructor() {
    super(DatasetSource.FAERS, {
      baseUrl: datasetConfig.getSourceBaseUrl('faers', 'https://api.fda.gov/'),
      resourcePath: 'drug/event.json',
      pageParam: 'skip',
      pageSizeParam: 'limit',
      defaultPageSize: 100
    });
  }

  protected parseItems(response: any): unknown[] {
    return response?.results ?? [];
  }

  protected override hasMore(response: any): boolean {
    const total = response?.meta?.results?.total ?? 0;
    const skip = response?.meta?.results?.skip ?? 0;
    const limit = response?.meta?.results?.limit ?? 0;
    return skip + limit < total;
  }
}

class CmsPufConnector extends FileDownloadConnector {
  constructor() {
    super(DatasetSource.CMS_PUF, {
      downloadUrl: datasetConfig.getSourceDownloadUrl(
        'cms_puf',
        'https://download.cms.gov/data/public-use-files.zip'
      )
    });
  }

  protected getFileExtension(response: FetchResponse): string {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('zip')) {
      return '.zip';
    }
    return '.bin';
  }
}

class GenericStaticConnector extends StaticDatasetConnector {
  constructor(source: DatasetSource, message: string) {
    super(source, { message, generatedAt: new Date().toISOString() });
  }
}

class MedlinePlusConnector extends RestPagerConnector {
  constructor() {
    super(DatasetSource.MedlinePlus, {
      baseUrl: datasetConfig.getSourceBaseUrl('medlineplus', 'https://wsearch.nlm.nih.gov/ws/'),
      resourcePath: 'search',
      pageParam: 'page',
      pageSizeParam: 'max',
      defaultPageSize: 100,
      staticParams: { db: 'healthTopics', term: 'cancer' }
    });
  }

  protected parseItems(response: any): unknown[] {
    const list = response?.list ?? {};
    const records = Array.isArray(list?.record) ? list.record : list?.record ? [list.record] : [];
    return records;
  }
}

class PubMedConnector extends RestPagerConnector {
  constructor() {
    super(DatasetSource.PubMedCentral, {
      baseUrl: datasetConfig.getSourceBaseUrl('pubmed', 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/'),
      resourcePath: 'esearch.fcgi',
      pageParam: 'retstart',
      pageSizeParam: 'retmax',
      defaultPageSize: 100,
      staticParams: { db: 'pmc', term: 'cancer', retmode: 'json' }
    });
  }

  protected parseItems(response: any): unknown[] {
    const ids = response?.esearchresult?.idlist ?? [];
    return ids;
  }
}

class NihSafetyConnector extends RestPagerConnector {
  constructor() {
    super(DatasetSource.NIHSafety, {
      baseUrl: datasetConfig.getSourceBaseUrl('nihsafety', 'https://api.fda.gov/'),
      resourcePath: 'drug/label.json',
      pageParam: 'skip',
      pageSizeParam: 'limit',
      defaultPageSize: 100
    });
  }

  protected parseItems(response: any): unknown[] {
    return response?.results ?? [];
  }

  protected override hasMore(response: any): boolean {
    const total = response?.meta?.results?.total ?? 0;
    const skip = response?.meta?.results?.skip ?? 0;
    const limit = response?.meta?.results?.limit ?? 0;
    return skip + limit < total;
  }
}

class UspstfConnector extends RestPagerConnector {
  constructor() {
    super(DatasetSource.USPSTF, {
      baseUrl: datasetConfig.getSourceBaseUrl('uspstf', 'https://www.uspreventiveservicestaskforce.org/'),
      resourcePath: 'api/recommendations',
      pageParam: 'page',
      pageSizeParam: 'pageSize',
      defaultPageSize: 50
    });
  }

  protected parseItems(response: any): unknown[] {
    return response?.data ?? [];
  }

  protected override hasMore(response: any): boolean {
    const { page, totalPages } = response?.pagination ?? {};
    return typeof page === 'number' && typeof totalPages === 'number' ? page < totalPages : false;
  }
}

class StatPearlsConnector extends GenericStaticConnector {
  constructor() {
    super(
      DatasetSource.StatPearls,
      'StatPearls content requires institutional access. Provide API credentials via DATASET_STATPEARLS_BASE_URL to enable ingestion.'
    );
  }
}

class DataIngestionConnector extends GenericStaticConnector {
  constructor() {
    super(
      DatasetSource.DataIngestion,
      'Internal ingestion orchestrations are handled via this module. Trigger POST /api/datasets/:source/ingest to capture new snapshots.'
    );
  }
}

class FireScrapeToolConnector extends GenericStaticConnector {
  constructor() {
    super(
      DatasetSource.FireScrapeTool,
      'FireScrape tool results are streamed separately. Provide DATASET_FIRESCRAPETOOL_DOWNLOAD_URL to persist crawled artifacts.'
    );
  }
}

class CdcGuidelinesConnector extends RestPagerConnector {
  constructor() {
    super(DatasetSource.CDCGuidelines, {
      baseUrl: datasetConfig.getSourceBaseUrl('cdc', 'https://www.cdc.gov/'),
      resourcePath: 'api/v2/resources',
      pageParam: 'page',
      pageSizeParam: 'pageSize',
      defaultPageSize: 100
    });
  }

  protected parseItems(response: any): unknown[] {
    return response?.results ?? [];
  }
}

class SeerConnector extends GenericStaticConnector {
  constructor() {
    super(
      DatasetSource.SEER,
      'SEER data requires subscription. Upload exports to object storage and set DATASET_SEER_DOWNLOAD_URL to ingest.'
    );
  }
}

class NhanesConnector extends RestPagerConnector {
  constructor() {
    super(DatasetSource.NHANES, {
      baseUrl: datasetConfig.getSourceBaseUrl('nhanes', 'https://healthdata.gov/api/'),
      resourcePath: 'views/7pwj-59pg/rows.json',
      pageParam: 'page',
      pageSizeParam: 'pageSize',
      defaultPageSize: 100
    });
  }

  protected parseItems(response: any): unknown[] {
    return response?.data ?? [];
  }
}

class NppesConnector extends FileDownloadConnector {
  constructor() {
    super(DatasetSource.NPPES, {
      downloadUrl: datasetConfig.getSourceDownloadUrl(
        'nppes',
        'https://download.cms.gov/nppes/NPI_Files.html'
      )
    });
  }

  protected getFileExtension(response: FetchResponse): string {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('zip')) {
      return '.zip';
    }
    return '.bin';
  }
}

class SyntheaConnector extends FileDownloadConnector {
  constructor() {
    super(DatasetSource.Synthea, {
      downloadUrl: datasetConfig.getSourceDownloadUrl('synthea', 'https://synthetichealth.github.io/synthea-sample-data/downloads/synthea_sample_data_fhir_102.zip')
    });
  }

  protected getFileExtension(response: FetchResponse): string {
    return response.headers.get('content-type')?.includes('zip') ? '.zip' : '.bin';
  }
}

class InternationalRegistriesConnector extends GenericStaticConnector {
  constructor() {
    super(
      DatasetSource.InternationalRegistries,
      'International registry ingestion requires custom connectors. Configure DATASET_INTERNATIONALREGISTRIES_DOWNLOAD_URL to supply curated exports.'
    );
  }
}

class ChexpertConnector extends GenericStaticConnector {
  constructor() {
    super(
      DatasetSource.CheXpertSplits,
      'CheXpert splits are distributed under research agreements. Upload JSON manifests to storage and configure DATASET_CHEXPERTSPLITS_DOWNLOAD_URL.'
    );
  }
}

class MimicSplitsConnector extends GenericStaticConnector {
  constructor() {
    super(
      DatasetSource.MIMICSplits,
      'MIMIC derived splits require protected data access. Provide secure download URL via DATASET_MIMICSPLITS_DOWNLOAD_URL.'
    );
  }
}

class RidCovidConnector extends GenericStaticConnector {
  constructor() {
    super(
      DatasetSource.RIDCOVID,
      'RID-COVID artifacts are hosted externally. Configure DATASET_RIDCOVID_DOWNLOAD_URL to enable ingestion.'
    );
  }
}

class RjuaConnector extends GenericStaticConnector {
  constructor() {
    super(
      DatasetSource.RJUAQA,
      'RJUA-QA dataset ingestion expects pre-signed URLs provided through DATASET_RJUAQA_DOWNLOAD_URL.'
    );
  }
}

class DdxPlusConnector extends GenericStaticConnector {
  constructor() {
    super(
      DatasetSource.DDXPlus,
      'DDXPlus dataset requires approval. Supply dataset artifact via DATASET_DDXPLUS_DOWNLOAD_URL.'
    );
  }
}

class LunaConnector extends GenericStaticConnector {
  constructor() {
    super(
      DatasetSource.LUNA16,
      'LUNA16 dataset ingestion expects manual upload. Point DATASET_LUNA16_DOWNLOAD_URL to a prepared archive.'
    );
  }
}

class MimicConnector extends GenericStaticConnector {
  constructor() {
    super(
      DatasetSource.MIMIC_IV,
      'MIMIC-IV is restricted. Configure DATASET_MIMIC_IV_DOWNLOAD_URL for approved exports.'
    );
  }
}

class EicuConnector extends GenericStaticConnector {
  constructor() {
    super(
      DatasetSource.EICU_CRD,
      'eICU-CRD requires credentialed access. Configure DATASET_EICU_CRD_DOWNLOAD_URL to ingest snapshots.'
    );
  }
}

export function createDatasetConnectors(): Map<DatasetSource, DatasetConnector> {
  return new Map<DatasetSource, DatasetConnector>([
    [DatasetSource.DataIngestion, new DataIngestionConnector()],
    [DatasetSource.FireScrapeTool, new FireScrapeToolConnector()],
    [DatasetSource.DailyMed, new DailyMedConnector()],
    [DatasetSource.ClinicalTrials, new ClinicalTrialsConnector()],
    [DatasetSource.OrangeBook, new OrangeBookConnector()],
    [DatasetSource.OpenFDA, new OpenFdaConnector()],
    [DatasetSource.FAERS, new FaersConnector()],
    [DatasetSource.CMS_PUF, new CmsPufConnector()],
    [DatasetSource.MedlinePlus, new MedlinePlusConnector()],
    [DatasetSource.PubMedCentral, new PubMedConnector()],
    [DatasetSource.NIHSafety, new NihSafetyConnector()],
    [DatasetSource.USPSTF, new UspstfConnector()],
    [DatasetSource.StatPearls, new StatPearlsConnector()],
    [DatasetSource.CDCGuidelines, new CdcGuidelinesConnector()],
    [DatasetSource.SEER, new SeerConnector()],
    [DatasetSource.NHANES, new NhanesConnector()],
    [DatasetSource.NPPES, new NppesConnector()],
    [DatasetSource.Synthea, new SyntheaConnector()],
    [DatasetSource.InternationalRegistries, new InternationalRegistriesConnector()],
    [DatasetSource.CheXpertSplits, new ChexpertConnector()],
    [DatasetSource.MIMICSplits, new MimicSplitsConnector()],
    [DatasetSource.RIDCOVID, new RidCovidConnector()],
    [DatasetSource.RJUAQA, new RjuaConnector()],
    [DatasetSource.DDXPlus, new DdxPlusConnector()],
    [DatasetSource.LUNA16, new LunaConnector()],
    [DatasetSource.MIMIC_IV, new MimicConnector()],
    [DatasetSource.EICU_CRD, new EicuConnector()]
  ]);
}
