import {
  Condition,
  FacilityReportInput,
  PatientReportInput,
  ProviderReportInput,
  ResultScaleType,
  Specimen,
  SpecimenBodySite,
  SpecimenInput,
} from "../../generated/graphql";

export const defaultPatientReportInputState: PatientReportInput = {
  city: "",
  country: "USA",
  county: "",
  dateOfBirth: "",
  email: "",
  ethnicity: "",
  firstName: "",
  lastName: "",
  middleName: "",
  phone: "",
  race: "",
  sex: "",
  state: "",
  street: "",
  streetTwo: "",
  suffix: "",
  tribalAffiliation: "",
  zipCode: "",
};

export const defaultProviderReportInputState: ProviderReportInput = {
  city: "",
  county: "",
  email: "",
  firstName: "",
  lastName: "",
  middleName: "",
  npi: "",
  phone: "",
  state: "",
  street: "",
  streetTwo: "",
  suffix: "",
  zipCode: "",
  country: "USA",
};

export const defaultFacilityReportInputState: FacilityReportInput = {
  city: "",
  clia: "",
  county: "",
  email: "",
  name: "",
  phone: "",
  state: "",
  street: "",
  streetTwo: "",
  zipCode: "",
  country: "USA",
};

export const defaultSpecimenReportInputState: SpecimenInput = {
  snomedTypeCode: "",
  collectionDate: "",
  receivedDate: "",
  collectionLocationCode: "",
  collectionLocationName: "",
};

export const PLACEHOLDER_SPECIMENS: Specimen[] = [
  {
    loincSystemCode: "",
    snomedDisplay: "Swab of internal nose",
    snomedCode: "445297001",
  },
  {
    loincSystemCode: "",
    snomedDisplay: "Nasopharyngeal swab",
    snomedCode: "258500001",
  },
  {
    loincSystemCode: "",
    snomedDisplay: "Venous blood specimen",
    snomedCode: "122555007",
  },
  {
    loincSystemCode: "",
    snomedDisplay: "Oral fluid specimen",
    snomedCode: "441620008",
  },
] as Specimen[];

export const mapScaleDisplayToResultScaleType = (scaleDisplay: string) => {
  switch (scaleDisplay) {
    case "Nom":
      return ResultScaleType.Nominal;
    case "Ord":
      return ResultScaleType.Ordinal;
    case "Qn":
      return ResultScaleType.Quantitative;
    default:
      return ResultScaleType.Ordinal;
  }
};

export const buildSpecimenOptionList = (specimens: Specimen[]) => {
  const options = specimens.map((specimen) => {
    return {
      value: specimen.snomedCode,
      label: `${specimen.snomedDisplay} - ${specimen.snomedCode}`,
    };
  });
  options.sort((a, b) => a.label.localeCompare(b.label));
  return options;
};

export enum UNIVERSAL_CONDITIONS {
  COVID_19 = "COVID-19",
  FLU_A = "Flu A",
  FLU_B = "Flu B",
  RSV = "RSV",
  HIV = "HIV",
  SYPHILIS = "Syphilis",
  FLU_A_AND_B = "Flu A and B",
  HEPATITIS_C = "Hepatitis C",
  GONORRHEA = "Gonorrhea",
  CHLAMYDIA = "Chlamydia",
}

export const ResultScaleTypeOptions: {
  label: string;
  value: ResultScaleType;
}[] = [
  {
    label: ResultScaleType.Ordinal,
    value: ResultScaleType.Ordinal,
  },
  {
    label: ResultScaleType.Quantitative,
    value: ResultScaleType.Quantitative,
  },
  {
    label: ResultScaleType.Nominal,
    value: ResultScaleType.Nominal,
  },
];

export const buildConditionsOptionList = (conditions: Condition[]) => {
  const options = conditions.map((condition) => {
    return {
      value: condition.code,
      label: `${condition.display} - ${condition.code}`,
    };
  });
  options.sort((a, b) => a.label.localeCompare(b.label));
  return options;
};

export const buildBodySiteOptionsList = (
  specimenBodySites: SpecimenBodySite[]
) => {
  if (specimenBodySites.length === 0) {
    return [
      {
        value: "",
        label: "No collection location available",
      },
    ];
  }
  const options = specimenBodySites.map((bodySite) => {
    return {
      value: bodySite.snomedSiteCode,
      label: bodySite.snomedSiteDisplay,
    };
  });
  options.sort((a, b) => a.label.localeCompare(b.label));
  return options;
};

export type TestPerformedLoinc = {
  code: string;
  resultType: string;
  shortName: string;
};

export type TestOrderLoinc = {
  title: string;
  description: string;
  code: string;
  performedTests: TestPerformedLoinc[];
};

const mockTestOrderLoincList = [
  {
    title: "Chronic iridocyclitis, left eye",
    description: "Chronic iridocyclitis, left eye",
    code: "H2012",
    performedTests: [
      {
        code: "0QW807Z",
        resultType: "Ordinal",
        shortName: "Revision of Autol Sub in R Femur Shaft, Open Approach",
      },
    ],
  },
  {
    title: "Moderate laceration of heart w hemopericardium, init encntr",
    description:
      "Moderate laceration of heart with hemopericardium, initial encounter",
    code: "S26021A",
    performedTests: [
      {
        code: "0P9J4ZX",
        resultType: "Ordinal",
        shortName: "Drainage of Left Radius, Perc Endo Approach, Diagn",
      },
    ],
  },
  {
    title: "Corrosion of unsp degree of abdominal wall, init encntr",
    description:
      "Corrosion of unspecified degree of abdominal wall, initial encounter",
    code: "T2142XA",
    performedTests: [
      {
        code: "F0135ZZ",
        resultType: "Ordinal",
        shortName:
          "Range of Motion and Joint Integrity Assessment of Neuro Body",
      },
      {
        code: "037L36Z",
        resultType: "Ordinal",
        shortName: "Dilation of L Int Carotid with 3 Drug-elut, Perc Approach",
      },
      {
        code: "0NUG3JZ",
        resultType: "Ordinal",
        shortName: "Supplement Left Ethmoid Bone with Synth Sub, Perc Approach",
      },
      {
        code: "07VH0DZ",
        resultType: "Nominal",
        shortName: "Restrict of R Inqnl Lymph with Intralum Dev, Open Approach",
      },
      {
        code: "0RH44DZ",
        resultType: "Nominal",
        shortName:
          "Insert of Facet Stabl Dev into C-thor Jt, Perc Endo Approach",
      },
    ],
  },
  {
    title: "Abrasion of right back wall of thorax",
    description: "Abrasion of right back wall of thorax",
    code: "S20411",
    performedTests: [
      {
        code: "02C10ZZ",
        resultType: "Ordinal",
        shortName: "Extirpation of Matter from 2 Cor Art, Open Approach",
      },
      {
        code: "F07K0EZ",
        resultType: "Nominal",
        shortName: "ROM & Jt Mobility Trmt Musculosk Up Back/UE w Orthosis",
      },
      {
        code: "0KSV0ZZ",
        resultType: "Ordinal",
        shortName: "Reposition Right Foot Muscle, Open Approach",
      },
      {
        code: "037K3ZZ",
        resultType: "Ordinal",
        shortName: "Dilation of Right Internal Carotid Artery, Perc Approach",
      },
    ],
  },
  {
    title: "Complete rotatr-cuff tear/ruptr of left shoulder, not trauma",
    description:
      "Complete rotator cuff tear or rupture of left shoulder, not specified as traumatic",
    code: "M75122",
    performedTests: [
      {
        code: "061M4ZY",
        resultType: "Ordinal",
        shortName:
          "Bypass Right Femoral Vein to Lower Vein, Perc Endo Approach",
      },
      {
        code: "0J990ZX",
        resultType: "Ordinal",
        shortName: "Drainage of Buttock Subcu/Fascia, Open Approach, Diagn",
      },
    ],
  },
  {
    title: "Person outside bus inj in clsn w rail trn/veh in traf, subs",
    description:
      "Person on outside of bus injured in collision with railway train or railway vehicle in traffic accident, subsequent encounter",
    code: "V757XXD",
    performedTests: [
      {
        code: "0CNT3ZZ",
        resultType: "Ordinal",
        shortName: "Release Right Vocal Cord, Percutaneous Approach",
      },
    ],
  },
  {
    title: "Nondisp transverse fx shaft of l tibia, 7thD",
    description:
      "Nondisplaced transverse fracture of shaft of left tibia, subsequent encounter for closed fracture with routine healing",
    code: "S82225D",
    performedTests: [
      {
        code: "08RX0KZ",
        resultType: "Ordinal",
        shortName:
          "Replacement of R Lacrml Duct with Nonaut Sub, Open Approach",
      },
    ],
  },
  {
    title: "Basal cell carcinoma skin/ unsp lower limb, including hip",
    description:
      "Basal cell carcinoma of skin of unspecified lower limb, including hip",
    code: "C44711",
    performedTests: [
      {
        code: "0KX04Z0",
        resultType: "Ordinal",
        shortName: "Transfer Head Muscle with Skin, Perc Endo Approach",
      },
      {
        code: "06SC3ZZ",
        resultType: "Quantitative",
        shortName: "Reposition Right Common Iliac Vein, Percutaneous Approach",
      },
      {
        code: "0DW670Z",
        resultType: "Ordinal",
        shortName: "Revision of Drainage Device in Stomach, Via Opening",
      },
      {
        code: "0RPQ35Z",
        resultType: "Ordinal",
        shortName: "Removal of Ext Fix from R Carpal Jt, Perc Approach",
      },
      {
        code: "04R947Z",
        resultType: "Ordinal",
        shortName: "Replace of R Renal Art with Autol Sub, Perc Endo Approach",
      },
    ],
  },
  {
    title: "Milt op w thermal radn effect of nuclear weapon, milt, subs",
    description:
      "Military operations involving thermal radiation effect of nuclear weapon, military personnel, subsequent encounter",
    code: "Y37530D",
    performedTests: [
      {
        code: "0CRS7JZ",
        resultType: "Nominal",
        shortName:
          "Replacement of Larynx with Synthetic Substitute, Via Opening",
      },
    ],
  },
  {
    title: "Non-prs chr ulcer oth prt unsp foot limited to brkdwn skin",
    description:
      "Non-pressure chronic ulcer of other part of unspecified foot limited to breakdown of skin",
    code: "L97501",
    performedTests: [
      {
        code: "039M40Z",
        resultType: "Nominal",
        shortName:
          "Drainage of R Ext Carotid with Drain Dev, Perc Endo Approach",
      },
      {
        code: "0TTB4ZZ",
        resultType: "Ordinal",
        shortName: "Resection of Bladder, Percutaneous Endoscopic Approach",
      },
      {
        code: "0X0F3ZZ",
        resultType: "Ordinal",
        shortName: "Alteration of Left Lower Arm, Percutaneous Approach",
      },
    ],
  },
  {
    title: "Driver of hv veh injured in clsn w hv veh nontraf, sequela",
    description:
      "Driver of heavy transport vehicle injured in collision with heavy transport vehicle or bus in nontraffic accident, sequela",
    code: "V640XXS",
    performedTests: [
      {
        code: "0P894ZZ",
        resultType: "Ordinal",
        shortName:
          "Division of Right Clavicle, Percutaneous Endoscopic Approach",
      },
      {
        code: "0QHG06Z",
        resultType: "Quantitative",
        shortName: "Insertion of Intramed Fix into R Tibia, Open Approach",
      },
      {
        code: "047A056",
        resultType: "Nominal",
        shortName: "Dilate L Renal Art, Bifurc, w 2 Drug-elut, Open",
      },
      {
        code: "041L4KH",
        resultType: "Ordinal",
        shortName: "Bypass L Fem Art to R Femor A w Nonaut Sub, Perc Endo",
      },
      {
        code: "037C4F6",
        resultType: "Ordinal",
        shortName: "Dilate L Radial Art, Bifurc, w 3 Intralum Dev, Perc Endo",
      },
    ],
  },
  {
    title: "Contact w unsp sharp object, undetermined intent, init",
    description:
      "Contact with unspecified sharp object, undetermined intent, initial encounter",
    code: "Y289XXA",
    performedTests: [
      {
        code: "BL31ZZZ",
        resultType: "Ordinal",
        shortName: "MRI of Low Extrem Connectiv Tiss",
      },
      {
        code: "0N960ZX",
        resultType: "Quantitative",
        shortName: "Drainage of Left Temporal Bone, Open Approach, Diagnostic",
      },
      {
        code: "30240R1",
        resultType: "Ordinal",
        shortName: "Transfuse Nonaut Platelets in Central Vein, Open",
      },
      {
        code: "02700DZ",
        resultType: "Quantitative",
        shortName: "Dilation of 1 Cor Art with Intralum Dev, Open Approach",
      },
      {
        code: "0VB24ZX",
        resultType: "Ordinal",
        shortName:
          "Excision of Left Seminal Vesicle, Perc Endo Approach, Diagn",
      },
    ],
  },
  {
    title: "Oth fracture of unsp talus, subs for fx w malunion",
    description:
      "Other fracture of unspecified talus, subsequent encounter for fracture with malunion",
    code: "S92199P",
    performedTests: [
      {
        code: "0XUT07Z",
        resultType: "Ordinal",
        shortName: "Supplement Left Ring Finger with Autol Sub, Open Approach",
      },
      {
        code: "0W190JJ",
        resultType: "Nominal",
        shortName: "Bypass R Pleural Cav to Pelvic Cav w Synth Sub, Open",
      },
      {
        code: "0JH636Z",
        resultType: "Ordinal",
        shortName: "Insert Pace. Dual Cham in Chest Subcu/Fascia, Perc",
      },
    ],
  },
  {
    title: "Acquired deformity of pinna, bilateral",
    description: "Acquired deformity of pinna, bilateral",
    code: "H61113",
    performedTests: [
      {
        code: "F0126YZ",
        resultType: "Ordinal",
        shortName: "Sensory/Processing Assess Neuro Low Back/LE w Oth Equip",
      },
      {
        code: "05UL3JZ",
        resultType: "Ordinal",
        shortName: "Supplement Intracranial Vein with Synth Sub, Perc Approach",
      },
    ],
  },
  {
    title: "Superficial foreign body of unspecified ear, subs encntr",
    description:
      "Superficial foreign body of unspecified ear, subsequent encounter",
    code: "S00459D",
    performedTests: [
      {
        code: "B3131ZZ",
        resultType: "Quantitative",
        shortName: "Fluoroscopy of R Com Carotid using L Osm Contrast",
      },
    ],
  },
  {
    title: "Toxic effect of phosphorus and its compounds, acc, init",
    description:
      "Toxic effect of phosphorus and its compounds, accidental (unintentional), initial encounter",
    code: "T571X1A",
    performedTests: [
      {
        code: "0P523ZZ",
        resultType: "Ordinal",
        shortName: "Destruction of Left Rib, Percutaneous Approach",
      },
      {
        code: "0CRS77Z",
        resultType: "Nominal",
        shortName: "Replacement of Larynx with Autol Sub, Via Opening",
      },
      {
        code: "07HK03Z",
        resultType: "Quantitative",
        shortName:
          "Insertion of Infusion Dev into Thoracic Duct, Open Approach",
      },
      {
        code: "0WH533Z",
        resultType: "Ordinal",
        shortName: "Insertion of Infusion Device into Lower Jaw, Perc Approach",
      },
      {
        code: "03L14CZ",
        resultType: "Ordinal",
        shortName: "Occlusion L Int Mamm Art w Extralum Dev, Perc Endo",
      },
    ],
  },
  {
    title: "External constriction of lip, sequela",
    description: "External constriction of lip, sequela",
    code: "S00541S",
    performedTests: [
      {
        code: "041C4AR",
        resultType: "Ordinal",
        shortName: "Bypass R Com Iliac Art to Low Art w Autol Art, Perc Endo",
      },
      {
        code: "0D557ZZ",
        resultType: "Quantitative",
        shortName:
          "Destruction of Esophagus, Via Natural or Artificial Opening",
      },
      {
        code: "0RJS3ZZ",
        resultType: "Ordinal",
        shortName: "Inspection of Right Metacarpocarpal Joint, Perc Approach",
      },
    ],
  },
  {
    title: "Primary blast injury of bronchus, unilateral, init encntr",
    description:
      "Primary blast injury of bronchus, unilateral, initial encounter",
    code: "S27411A",
    performedTests: [
      {
        code: "0FF8XZZ",
        resultType: "Nominal",
        shortName: "Fragmentation in Cystic Duct, External Approach",
      },
      {
        code: "0SWG03Z",
        resultType: "Quantitative",
        shortName: "Revision of Infusion Device in L Ankle Jt, Open Approach",
      },
      {
        code: "02174ZT",
        resultType: "Quantitative",
        shortName: "Bypass Left Atrium to L Pulm Vn, Perc Endo Approach",
      },
      {
        code: "0PW547Z",
        resultType: "Ordinal",
        shortName: "Revision of Autol Sub in R Scapula, Perc Endo Approach",
      },
      {
        code: "B41JYZZ",
        resultType: "Ordinal",
        shortName: "Fluoroscopy of Other Lower Arteries using Other Contrast",
      },
    ],
  },
  {
    title: "Other specified diseases of the digestive system",
    description: "Other specified diseases of the digestive system",
    code: "K928",
    performedTests: [
      {
        code: "0QW30JZ",
        resultType: "Nominal",
        shortName: "Revision of Synth Sub in L Pelvic Bone, Open Approach",
      },
      {
        code: "F00ZNNZ",
        resultType: "Quantitative",
        shortName:
          "Non-inv Instrument Status Assess w Biosensory Feedback Equip",
      },
    ],
  },
  {
    title: "Unspecified open wound of right forearm, sequela",
    description: "Unspecified open wound of right forearm, sequela",
    code: "S51801S",
    performedTests: [
      {
        code: "047A4GZ",
        resultType: "Quantitative",
        shortName: "Dilate L Renal Art w 4+ Intralum Dev, Perc Endo",
      },
      {
        code: "7W07X6Z",
        resultType: "Ordinal",
        shortName:
          "Osteopathic Treatment of Upper Extremities using Lymph Pump",
      },
      {
        code: "0LNMXZZ",
        resultType: "Ordinal",
        shortName: "Release Left Upper Leg Tendon, External Approach",
      },
    ],
  },
] as TestOrderLoinc[];

export const useFilteredTestOrderLoincListQueryStub = (): TestOrderLoinc[] => {
  return mockTestOrderLoincList;
};
