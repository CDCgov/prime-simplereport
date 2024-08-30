import {
  AllSymptomsCode,
  allSymptomsMap,
  AllSymptomsName,
} from "../../patientApp/timeOfTest/constants";

export const symptomsStringToArray = (
  symptomString: string
): AllSymptomsName[] => {
  const parsed: { [_k in AllSymptomsCode]: "true" | "false" } =
    JSON.parse(symptomString);
  return Object.entries(parsed).reduce((acc, [code, symptomatic]) => {
    if (symptomatic === "true") {
      acc.push(allSymptomsMap[code as AllSymptomsCode]);
    }
    return acc;
  }, [] as AllSymptomsCode[]);
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
