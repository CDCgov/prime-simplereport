// BEGIN things that should be service calls
export const symptoms = {
  "426000000": "Fever over 100.4F",
  "103001002": "Feeling feverish",
  "43724002": "Chills",
  "49727002": "Cough",
  "267036007": "Shortness of breath",
  "230145002": "Difficulty breathing",
  "84229001": "Fatigue",
  "68962001": "Muscle or body aches",
  "25064002": "Headache",
  "36955009": "New loss of taste",
  "44169009": "New loss of smell",
  "162397003": "Sore throat",
  "68235000": "Nasal congestion",
  "64531003": "Runny nose",
  "422587007": "Nausea",
  "422400008": "Vomiting",
  "62315008": "Diarrhea",
} as const;

export type Symptoms = typeof symptoms;
export type SymptomCode = keyof Symptoms;
export type SymptomName = Symptoms[SymptomCode];

export const globalSymptomDefinitions = Object.entries(symptoms).reduce(
  (acc, [code, name]) => {
    acc.push({ value: code as SymptomCode, label: name });
    return acc;
  },
  [] as { value: SymptomCode; label: SymptomName }[]
);

export const getSymptomList = () => globalSymptomDefinitions;

export const getTestTypes = () => [
  { label: "Molecular", value: "1" },
  { label: "Antigen", value: "2" },
  { label: "Antibody/Serology", value: "3" },
  { label: "Unknown", value: "4" },
];

export const getPregnancyResponses = () => [
  { label: "Yes", value: "77386006" },
  { label: "No", value: "60001007" },
  { label: "Prefer not to answer", value: "261665006" },
];

export const getTimeOfTestSteps = () => [
  {
    label: "Profile information",
    value: "profile",
    order: 0,
  },
  {
    label: "Symptoms and history",
    value: "symptoms",
    order: 1,
  },
];

export const getTestResultDeliveryPreferences = () => [
  { label: "Text message", value: "SMS" },
  { label: "None", value: "NONE" },
];
