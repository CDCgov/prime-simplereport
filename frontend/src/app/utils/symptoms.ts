import {
  respiratorySymptomsMap,
  RespiratorySymptomCode,
  RespiratorySymptomName,
} from "../../patientApp/timeOfTest/constants";

export const symptomsStringToArray = (
  symptomString: string
): RespiratorySymptomName[] => {
  const parsed: { [k in RespiratorySymptomCode]: "true" | "false" } =
    JSON.parse(symptomString);
  return Object.entries(parsed).reduce((acc, [code, symptomatic]) => {
    if (symptomatic === "true") {
      acc.push(respiratorySymptomsMap[code as RespiratorySymptomCode]);
    }
    return acc;
  }, [] as RespiratorySymptomName[]);
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
