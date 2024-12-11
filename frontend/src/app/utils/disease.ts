import { useFeature } from "flagged";

import { MULTIPLEX_DISEASES } from "../testResults/constants";

export const useSupportedDiseaseList = () => {
  let allDiseases = Object.values(MULTIPLEX_DISEASES);
  const hivEnabled = Boolean(useFeature("hivEnabled"));
  if (!hivEnabled) {
    allDiseases = allDiseases.filter((d) => d !== MULTIPLEX_DISEASES.HIV);
  }
  const syphilisEnabled = Boolean(useFeature("syphilisEnabled"));
  if (!syphilisEnabled) {
    allDiseases = allDiseases.filter((d) => d !== MULTIPLEX_DISEASES.SYPHILIS);
  }
  const hepatitisCEnabled = Boolean(useFeature("hepatitisCEnabled"));
  if (!hepatitisCEnabled) {
    allDiseases = allDiseases.filter(
      (d) => d !== MULTIPLEX_DISEASES.HEPATITIS_C
    );
  }
  const gonorrheaEnabled = Boolean(useFeature("gonorrheaEnabled"));
  if (!gonorrheaEnabled) {
    allDiseases = allDiseases.filter((d) => d !== MULTIPLEX_DISEASES.GONORRHEA);
  }
  return allDiseases;
};

export const useDisabledFeatureDiseaseList = () => {
  const allDiseases = Object.values(MULTIPLEX_DISEASES);
  const supportedDiseases = useSupportedDiseaseList();
  return allDiseases.filter((d) => !supportedDiseases.includes(d));
};

export const useSupportedDiseaseOptionList = () => {
  const supportedDiseases = useSupportedDiseaseList();
  const options = supportedDiseases.map((disease) => {
    return {
      value: disease,
      label: disease,
    };
  });
  options.sort((a, b) => (a.label > b.label ? 1 : -1));
  return options;
};
