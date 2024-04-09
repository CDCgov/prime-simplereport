import { useFeature } from "flagged";

import { MULTIPLEX_DISEASES } from "../testResults/constants";

export const useSupportedDiseaseList = () => {
  let allDiseases = Object.values(MULTIPLEX_DISEASES);
  const hivEnabled = Boolean(useFeature("hivEnabled"));
  if (!hivEnabled) {
    allDiseases = allDiseases.filter((d) => d !== MULTIPLEX_DISEASES.HIV);
  }
  return allDiseases;
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
