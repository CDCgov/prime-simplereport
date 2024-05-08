import { SymptomDefinitionMap } from "../../../patientApp/timeOfTest/constants";

export const parseSymptoms = (
  symptomsJsonString: string | null | undefined,
  symptomSelectionMap: SymptomDefinitionMap[]
) => {
  const symptoms: Record<string, boolean> = {};

  if (symptomsJsonString) {
    const parsedSymptoms: { [key: string]: string | boolean } =
      JSON.parse(symptomsJsonString);

    symptomSelectionMap.forEach((opt) => {
      const val = opt?.value;
      if (typeof parsedSymptoms[val] === "string") {
        symptoms[val] = parsedSymptoms[val] === "true";
      } else {
        symptoms[val] = parsedSymptoms[val] as boolean;
      }
    });
  } else {
    symptomSelectionMap.forEach((opt) => {
      symptoms[opt?.value] = false;
    });
  }
  return symptoms;
};
