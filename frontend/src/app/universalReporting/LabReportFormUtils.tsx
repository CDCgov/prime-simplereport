import { ResultScaleType } from "../../generated/graphql";

type Specimen = {
  name: string;
  type_code: string;
};

const DEFAULT_SPECIMENS: Specimen[] = [
  {
    name: "Swab of internal nose",
    type_code: "445297001",
  },
  {
    name: "Nasopharyngeal swab",
    type_code: "258500001",
  },
  {
    name: "Venous blood specimen",
    type_code: "122555007",
  },
  {
    name: "Oral fluid specimen",
    type_code: "441620008",
  },
];

export const useSpecimenTypeOptionList = () => {
  const options = DEFAULT_SPECIMENS.map((specimen) => {
    return {
      value: specimen.type_code,
      label: `${specimen.name} - ${specimen.type_code}`,
    };
  });
  options.sort((a, b) => (a.label > b.label ? 1 : -1));
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

export const useConditionOptionList = () => {
  const allConditions = Object.values(UNIVERSAL_CONDITIONS);
  const options = allConditions.map((disease) => {
    return {
      value: disease,
      label: disease,
    };
  });
  options.sort((a, b) => (a.label > b.label ? 1 : -1));
  return options;
};
