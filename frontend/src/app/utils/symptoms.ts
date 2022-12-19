import {
  symptomsMap,
  SymptomCode,
  SymptomName,
} from "../../patientApp/timeOfTest/constants";

export const symptomsStringToArray = (symptomString: string): SymptomName[] => {
  const parsed: { [k in SymptomCode]: "true" | "false" } =
    JSON.parse(symptomString);
  return Object.entries(parsed).reduce((acc, [code, symptomatic]) => {
    if (symptomatic === "true") {
      acc.push(symptomsMap[code as SymptomCode]);
    }
    return acc;
  }, [] as SymptomName[]);
};

// symptoms should be a JSON string
export function hasSymptomsForView(noSymptoms: boolean, symptoms: string) {
  if (noSymptoms) {
    return "No";
  }
  const symptomsList: Record<string, string> = JSON.parse(symptoms);
  for (let key in symptomsList) {
    if (symptomsList[key] === "true") {
      return "Yes";
    }
  }
  return "Unknown";
}
