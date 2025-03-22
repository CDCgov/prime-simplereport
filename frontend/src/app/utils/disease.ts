import { useFeature } from "flagged";

import { MULTIPLEX_DISEASES } from "../testResults/constants";

export const mapStringToDiseaseEnum = (
  diseaseName: string
): MULTIPLEX_DISEASES | null => {
  const normalized = diseaseName.toLowerCase();

  const diseaseMap: Record<string, MULTIPLEX_DISEASES> = {
    chlamydia: MULTIPLEX_DISEASES.CHLAMYDIA,
    gonorrhea: MULTIPLEX_DISEASES.GONORRHEA,
    "hepatitis c": MULTIPLEX_DISEASES.HEPATITIS_C,
    hiv: MULTIPLEX_DISEASES.HIV,
    syphilis: MULTIPLEX_DISEASES.SYPHILIS,
  };

  return diseaseMap[normalized] || null;
};

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
  const chlamydiaEnabled = Boolean(useFeature("chlamydiaEnabled"));
  if (!chlamydiaEnabled) {
    allDiseases = allDiseases.filter((d) => d !== MULTIPLEX_DISEASES.CHLAMYDIA);
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
