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
  Luna16Sample
} from '../types';

const simulateNetworkDelay = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, Math.random() * 800 + 200); // 200-1000ms delay
  });
};

export const fetchDailyMedData = (): Promise<DailyMedDrug[]> => {
  const data: DailyMedDrug[] = [
    { drug_name: 'LIDOCAINE HYDROCHLORIDE', last_updated: '2024-05-15' },
    { drug_name: 'METFORMIN HYDROCHLORIDE', last_updated: '2024-05-20' },
    { drug_name: 'ATORVASTATIN CALCIUM', last_updated: '2024-05-18' },
    { drug_name: 'AMLODIPINE BESYLATE', last_updated: '2024-05-21' },
    { drug_name: 'LISINOPRIL', last_updated: '2024-05-19' },
  ];
  return simulateNetworkDelay(data);
};

export const fetchOrangeBookData = (): Promise<OrangeBookProduct[]> => {
  const data: OrangeBookProduct[] = [
    { Application_Number: 'N020573', Product_No: '001', Form: 'TABLET;ORAL', Strength: '10MG', RLD: 'Yes', TE_Code: 'AB', Active_Ing: 'ATORVASTATIN CALCIUM', Patent_Numbers: ['5273995', '6126968'], Exclusivity_Codes: ['NCE'] },
    { Application_Number: 'N020573', Product_No: '002', Form: 'TABLET;ORAL', Strength: '20MG', RLD: 'Yes', TE_Code: 'AB', Active_Ing: 'ATORVASTATIN CALCIUM', Patent_Numbers: ['5273995'], Exclusivity_Codes: ['NCE'] },
    { Application_Number: 'N021202', Product_No: '001', Form: 'TABLET, EXTENDED RELEASE;ORAL', Strength: '500MG', RLD: 'Yes', TE_Code: 'AB', Active_Ing: 'METFORMIN HYDROCHLORIDE', Patent_Numbers: ['6099862'], Exclusivity_Codes: [] },
  ];
  return simulateNetworkDelay(data);
};

export const fetchGuidelineData = (): Promise<Guideline[]> => {
  const data: Guideline[] = [
    {
      guideline_title: '2023 Adult Immunization Schedule',
      version_date: '2023-02-10',
      source: 'CDC',
      recommendations: [
        { section: 'Influenza Vaccination', statement: 'Annual influenza vaccination is recommended for all persons aged ≥6 months who do not have contraindications.', evidence_grade: 'A' },
        { section: 'Tetanus, Diphtheria, and Acellular Pertussis (Tdap)', statement: 'Adults aged 19 years or older who have not received a Tdap vaccine should receive one dose, followed by a Td or Tdap booster every 10 years.', evidence_grade: 'A' },
      ],
    },
    {
        guideline_title: 'Management of Major Depressive Disorder (MDD)',
        version_date: '2022-05',
        source: 'VA/DoD',
        recommendations: [
            { section: 'Pharmacologic Therapy', statement: 'We recommend selective serotonin reuptake inhibitors (SSRIs) or serotonin-norepinephrine reuptake inhibitors (SNRIs) as first-line medication for most patients with MDD.', evidence_grade: 'Strong' },
        ],
    }
  ];
  return simulateNetworkDelay(data);
};

export const fetchNihSafetyData = (): Promise<NihSafetyRecord[]> => {
    const data: NihSafetyRecord[] = [
        { source: 'LactMed', generic_name: 'Ibuprofen', summary: 'Because of its short half-life and low levels in breastmilk, ibuprofen is a good choice for analgesia or antiinflammatory therapy in nursing mothers.', alternative_drugs: ['Acetaminophen', 'Naproxen'] },
        { source: 'LiverTox', generic_name: 'Acetaminophen', summary: 'Acetaminophen is the most common cause of acute liver failure in the United States. Overdose is the primary cause, but therapeutic misadventure can also result in severe liver injury.' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchStatPearlsData = (): Promise<StatPearlsChapter[]> => {
    const data: StatPearlsChapter[] = [
        { book_id: 'NBK430685', title: 'Aspirin', summary: 'Aspirin is in a class of medications called salicylates. It works by stopping the production of certain natural substances that cause fever, pain, swelling, and blood clots.', references_count: 25 },
        { book_id: 'NBK532945', title: 'Type 2 Diabetes Mellitus', summary: 'Type 2 diabetes is a chronic metabolic condition characterized by insulin resistance and relative insulin deficiency, leading to hyperglycemia.', references_count: 42 },
    ];
    return simulateNetworkDelay(data);
};

export const fetchUspstfData = (age: number, sex: 'Male' | 'Female', tobacco_use: boolean): Promise<UspstfRecommendation[]> => {
    const recommendations: UspstfRecommendation[] = [];
    if (age >= 50 && age <= 75) {
        recommendations.push({ screening: 'Colorectal Cancer Screening', grade: 'A', rationale: 'The USPSTF recommends screening for colorectal cancer in all adults aged 50 to 75 years.', patient_profile: { age, sex, tobacco_use }});
    }
    if (age >= 55 && age <= 80 && tobacco_use) {
        recommendations.push({ screening: 'Lung Cancer Screening', grade: 'B', rationale: 'The USPSTF recommends annual screening for lung cancer with low-dose computed tomography (LDCT) in adults aged 55 to 80 years who have a 20 pack-year smoking history and currently smoke or have quit within the past 15 years.', patient_profile: { age, sex, tobacco_use }});
    }
    if (sex === 'Female' && age >= 21 && age <= 65) {
        recommendations.push({ screening: 'Cervical Cancer Screening', grade: 'A', rationale: 'The USPSTF recommends screening for cervical cancer every 3 years with cervical cytology alone in women aged 21 to 29 years.', patient_profile: { age, sex, tobacco_use }});
    }
    if (recommendations.length === 0) {
        recommendations.push({ screening: 'No specific recommendations match profile', grade: 'I', rationale: 'Based on the provided profile, no specific Grade A or B recommendations apply. Consult a healthcare provider for personalized advice.', patient_profile: { age, sex, tobacco_use }});
    }
    return simulateNetworkDelay(recommendations);
};

export const fetchClinicalTrialsData = (): Promise<ClinicalTrial[]> => {
    const data: ClinicalTrial[] = [
        { NCTId: 'NCT04368728', BriefTitle: 'Study to Evaluate the Efficacy and Safety of a New Drug for Type 2 Diabetes', OverallStatus: 'Recruiting', Condition: ['Type 2 Diabetes Mellitus'], OutcomeMeasure: ['Change in HbA1c from Baseline'] },
        { NCTId: 'NCT05892369', BriefTitle: 'A Study of a Novel Immunotherapy in Patients With Advanced Melanoma', OverallStatus: 'Active, not recruiting', Condition: ['Melanoma'], OutcomeMeasure: ['Overall Survival', 'Progression-Free Survival'] },
    ];
    return simulateNetworkDelay(data);
};

export const fetchMedlinePlusData = (): Promise<MedlinePlusTopic[]> => {
    const data: MedlinePlusTopic[] = [
        { title: 'Diabetes', summary: 'Diabetes is a disease in which your blood glucose, or blood sugar, levels are too high. Glucose comes from the foods you eat. Insulin is a hormone that helps the glucose get into your cells to give them energy.', url: 'https://medlineplus.gov/diabetes.html', groups: ['Disorders and Conditions'], mesh_terms: ['Diabetes Mellitus'] },
        { title: 'High Blood Pressure', summary: 'Blood pressure is the force of your blood pushing against the walls of your arteries. Each time your heart beats, it pumps blood into the arteries. Your blood pressure is highest when your heart beats, pumping the blood. This is called systolic pressure.', url: 'https://medlineplus.gov/highbloodpressure.html', groups: ['Disorders and Conditions'], mesh_terms: ['Hypertension'] },
    ];
    return simulateNetworkDelay(data);
};

export const fetchMimicIvData = (): Promise<MimicIvData[]> => {
    const data: MimicIvData[] = [
        { table_name: 'patients', row_count: '299,712', description: 'Contains patient demographic information, including gender, date of birth, and dates of admission and discharge.' },
        { table_name: 'admissions', row_count: '431,231', description: 'Defines hospital admissions, including admission and discharge times, and admission type.' },
        { table_name: 'chartevents', row_count: '330,712,483', description: 'Contains all charted observations for patients, such as vital signs, laboratory results, and ventilator settings.' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchEicuCrdData = (): Promise<EicuCrdData[]> => {
    const data: EicuCrdData[] = [
        { table_name: 'patient', row_count: '200,859', description: 'Patient-level data including demographics, hospital admission, and discharge information.' },
        { table_name: 'vitalPeriodic', row_count: '> 2.7 billion', description: 'High-resolution periodic vital signs, captured as frequently as every 5 minutes.' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchFaersData = (): Promise<FaersData[]> => {
    const data: FaersData[] = [
        { report_id: '12345678-9', product_name: 'Aspirin', reaction: 'Gastric ulcer' },
        { report_id: '98765432-1', product_name: 'Lisinopril', reaction: 'Cough' },
        { report_id: '55555555-5', product_name: 'Atorvastatin', reaction: 'Myalgia' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchCmsPufData = (): Promise<CmsPufData[]> => {
    const data: CmsPufData[] = [
        { file_name: 'Medicare Provider Utilization and Payment Data: Part D Prescriber', description: 'Summarizes prescription claims data for providers who prescribe under the Medicare Part D program.', category: 'Provider Utilization' },
        { file_name: 'Hospital General Information', description: 'Contains general information about all Medicare-certified hospitals, including location, ownership, and services offered.', category: 'Provider Information' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchOpenFDAData = (): Promise<OpenFDAEndpoint[]> => {
    const data: OpenFDAEndpoint[] = [
        { name: 'Drug Adverse Event', description: 'Reports on adverse events related to drugs.', example_query: 'search=patient.reaction.reactionmeddrapt:"fatigue"' },
        { name: 'Drug Label', description: 'Information from drug labels, including indications, contraindications, and warnings.', example_query: 'search=openfda.brand_name:"Lipitor"' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchSeerData = (): Promise<SeerData[]> => {
    const data: SeerData[] = [
        { cancer_site: 'Breast', incidence_rate_per_100k: 130.8, five_year_survival_rate: '90.8%' },
        { cancer_site: 'Lung and Bronchus', incidence_rate_per_100k: 49.8, five_year_survival_rate: '25.4%' },
        { cancer_site: 'Prostate', incidence_rate_per_100k: 112.7, five_year_survival_rate: '97.1%' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchNhanesData = (): Promise<NhanesData[]> => {
    const data: NhanesData[] = [
        { data_cycle: '2017-2020', component: 'Demographics', description: 'Participant demographic information, including age, gender, race, and income.' },
        { data_cycle: '2017-2020', component: 'Dietary', description: 'Data on dietary intake from two 24-hour recall interviews.' },
        { data_cycle: '2017-2020', component: 'Laboratory', description: 'Results from various laboratory tests on blood, urine, and other specimens.' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchNppesData = (): Promise<NppesData[]> => {
    const data: NppesData[] = [
        { npi: '1234567890', provider_type: 'Physician', state: 'CA', name: 'John Doe' },
        { npi: '0987654321', provider_type: 'Hospital', state: 'NY', name: 'General Hospital' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchPubMedCentralData = (): Promise<PubMedArticle[]> => {
    const data: PubMedArticle[] = [
        { pmcid: 'PMC1000000', title: 'The role of genetics in complex diseases.', journal: 'Nature Reviews Genetics' },
        { pmcid: 'PMC2000000', title: 'Advances in cancer immunotherapy.', journal: 'Cell' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchSyntheaData = (): Promise<SyntheaPatient[]> => {
    const data: SyntheaPatient[] = [
        { patient_id: 'SYN123', conditions: ['Type 2 Diabetes', 'Hypertension'], medications: ['Metformin', 'Lisinopril'] },
        { patient_id: 'SYN456', conditions: ['Asthma'], medications: ['Albuterol'] },
    ];
    return simulateNetworkDelay(data);
};

export const fetchInternationalRegistriesData = (): Promise<InternationalRegistry[]> => {
    const data: InternationalRegistry[] = [
        { name: 'Clinical Practice Research Datalink (CPRD)', country: 'UK', description: 'Contains anonymized patient data from a network of general practitioner practices across the UK.' },
        { name: 'ICES Data Repository', country: 'Canada', description: 'Holds population-based health data for the province of Ontario, including claims and clinical data.' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchChexpertSplitsData = (): Promise<ChexpertSplit[]> => {
    const data: ChexpertSplit[] = [
        { split_type: 'train', file_name: 'chexpert_train.csv', description: 'Metadata for the CheXpert training set, pre-processed for model training.' },
        { split_type: 'validation', file_name: 'chexpert_valid.csv', description: 'Metadata for the CheXpert validation set, ready for model evaluation.' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchMimicSplitsData = (): Promise<MimicSplit[]> => {
    const data: MimicSplit[] = [
        { split_type: 'train', file_name: 'mimic_train.csv', description: 'Metadata for the MIMIC-CXR training set, pre-processed for model training.' },
        { split_type: 'validation', file_name: 'mimic_valid.csv', description: 'Metadata for the MIMIC-CXR validation set, ready for model evaluation.' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchRidCovidData = (): Promise<RidCovidData[]> => {
    const data: RidCovidData[] = [
        { dataset_focus: 'COVID-19 Severity', annotation_type: 'Severity Score', modality: 'X-ray, CT', description: 'A focused dataset for training models to assess the severity of COVID-19 from chest imaging.' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchRjuaQaData = (): Promise<RjuaQaPair[]> => {
    const data: RjuaQaPair[] = [
        { question: 'Patient presents with flank pain and hematuria. What are the likely differential diagnoses?', answer: 'The primary differentials include nephrolithiasis (kidney stones), urinary tract infection (UTI), or pyelonephritis. Less common causes could be renal cell carcinoma.', source: 'Virtual Patient Dialogue' },
        { question: 'What is the first-line treatment for uncomplicated BPH?', answer: 'First-line treatment for mild to moderate Benign Prostatic Hyperplasia (BPH) is typically an alpha-blocker, such as Tamsulosin, to relax bladder and prostate muscles.', source: 'Virtual Patient Dialogue' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchDdxPlusData = (): Promise<DdxPlusRecord[]> => {
    const data: DdxPlusRecord[] = [
        { record_id: 'SYN-PAT-001', diagnosis: 'Acute Bronchitis', symptoms_detected: ['Cough', 'Fatigue', 'Chest discomfort'], patient_profile: '45-year-old male, non-smoker.' },
        { record_id: 'SYN-PAT-002', diagnosis: 'Gastroesophageal Reflux Disease (GERD)', symptoms_detected: ['Heartburn', 'Regurgitation', 'Dysphagia'], patient_profile: '52-year-old female, reports symptoms after meals.' },
    ];
    return simulateNetworkDelay(data);
};

export const fetchLuna16Data = (): Promise<Luna16Sample[]> => {
    const data: Luna16Sample[] = [
        { series_uid: '1.3.6.1.4.1.14519.5.2.1.6279.6001.100225287222365663678666836860', nodule_count: 3, description: 'A series of CT scans from the LUNA16 challenge, annotated for lung nodule detection.' },
        { series_uid: '1.3.6.1.4.1.14519.5.2.1.6279.6001.100398138793540523459912234989', nodule_count: 1, description: 'Contains a single, well-defined lung nodule for detection algorithm testing.' },
    ];
    return simulateNetworkDelay(data);
};
