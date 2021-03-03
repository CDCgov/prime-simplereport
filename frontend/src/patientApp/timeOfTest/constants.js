// BEGIN things that should be service calls
export const globalSymptomDefinitions = [
  { value: "426000000", label: "Fever over 100.4F" },
  { value: "103001002", label: "Feeling feverish" },
  { value: "43724002", label: "Chills" },
  { value: "49727002", label: "Cough" },
  { value: "267036007", label: "Shortness of breath" },
  { value: "230145002", label: "Difficulty breathing" },
  { value: "84229001", label: "Fatigue" },
  { value: "68962001", label: "Muscle or body aches" },
  { value: "25064002", label: "Headache" },
  { value: "36955009", label: "New loss of taste" },
  { value: "44169009", label: "New loss of smell" },
  { value: "162397003", label: "Sore throat" },
  { value: "68235000", label: "Nasal congestion" },
  { value: "64531003", label: "Runny nose" },
  { value: "422587007", label: "Nausea" },
  { value: "422400008", label: "Vomiting" },
  { value: "62315008", label: "Diarrhea" },
];

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
