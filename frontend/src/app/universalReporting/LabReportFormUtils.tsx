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
import { RadioGroupOptions } from "../commonComponents/RadioGroup";
import { TEST_RESULTS_SNOMED } from "../testResults/constants";

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
  patientId: "",
  phone: "",
  race: "",
  sex: "",
  state: "",
  street: "",
  streetTwo: "",
  tribalAffiliation: "",
  zipCode: "",
};

export const defaultProviderReportInputState: ProviderReportInput = {
  city: "",
  county: "",
  email: "",
  firstName: "Count",
  lastName: "Dracula",
  middleName: "",
  npi: "0000000000",
  phone: "(555) 555-5555",
  state: "",
  street: "",
  streetTwo: "",
  suffix: "",
  zipCode: "",
};

export const defaultFacilityReportInputState: FacilityReportInput = {
  city: "Jefferson City",
  clia: "00D0000000",
  county: "Cole",
  email: "",
  name: "Dracula",
  phone: "(555) 555-5555",
  state: "MO",
  street: "201 W Capitol Ave",
  streetTwo: "",
  zipCode: "65101-6809",
};

export const defaultSpecimenReportInputState: SpecimenInput = {
  snomedTypeCode: "",
  collectionDate: "",
  receivedDate: "",
  collectionBodySiteCode: "",
  collectionBodySiteName: "",
};

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

export const ordinalResultOptions: RadioGroupOptions<string> = [
  {
    value: TEST_RESULTS_SNOMED.POSITIVE,
    label: `Positive (+)`,
  },
  {
    value: TEST_RESULTS_SNOMED.NEGATIVE,
    label: `Negative (-)`,
  },
  {
    value: TEST_RESULTS_SNOMED.UNDETERMINED,
    label: `Undetermined`,
  },
];

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
    const fullConditiondisplay = condition.snomedName
      ? `${condition.display}  -  ${condition.snomedName}  -  ${condition.code}`
      : `${condition.display}  -  ${condition.code}`;
    return {
      value: condition.code,
      label: fullConditiondisplay,
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
