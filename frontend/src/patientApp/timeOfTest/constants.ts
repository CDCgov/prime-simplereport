// BEGIN things that should be service calls
export const symptomsMap = {
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

export type Symptoms = typeof symptomsMap;
export type SymptomCode = keyof Symptoms;
export type SymptomName = Symptoms[SymptomCode];

export const pregnancyNoCode = "60001007";

export const pregnancyMap = {
  "77386006": "Yes",
  [pregnancyNoCode]: "No",
  "261665006": "Prefer not to answer",
} as const;

export type Pregnancy = typeof pregnancyMap;
export type PregnancyCode = keyof Pregnancy;
export type PregnancyDescription = Pregnancy[PregnancyCode];

const symptomOrder: SymptomCode[] = [
  "426000000",
  "103001002",
  "43724002",
  "49727002",
  "267036007",
  "230145002",
  "84229001",
  "68962001",
  "25064002",
  "36955009",
  "44169009",
  "162397003",
  "68235000",
  "64531003",
  "422587007",
  "422400008",
  "62315008",
];

export const globalSymptomDefinitions = symptomOrder.map((value) => ({
  value,
  label: symptomsMap[value],
}));

export const getSymptomList = () => globalSymptomDefinitions;

export const getTestTypes = () => [
  { label: "Molecular", value: "1" },
  { label: "Antigen", value: "2" },
  { label: "Antibody/Serology", value: "3" },
  { label: "Unknown", value: "4" },
];

type PregnancyResponses = {
  label: PregnancyDescription;
  value: PregnancyCode;
}[];

const pregancyOrder: PregnancyCode[] = [
  "77386006",
  pregnancyNoCode,
  "261665006",
];

export const getPregnancyResponses = (): PregnancyResponses =>
  pregancyOrder.map((value) => ({ value, label: pregnancyMap[value] }));

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
