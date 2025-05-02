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
