import {
  symptomsMap,
  SymptomCode,
  SymptomName,
} from "../../patientApp/timeOfTest/constants";

export const symptomsStringToArray = (symptomString: string): SymptomName[] => {
  const parsed: { [k in SymptomCode]: "true" | "false" } = JSON.parse(
    symptomString
  );
  return Object.entries(parsed).reduce((acc, [code, symptomatic]) => {
    if (symptomatic === "true") {
      acc.push(symptomsMap[code as SymptomCode]);
    }
    return acc;
  }, [] as SymptomName[]);
};
