import { TestResult } from "../testQueue/QueueItem";

export const COVID_RESULTS: { [key: string]: TestResult } = {
  POSITIVE: "POSITIVE",
  NEGATIVE: "NEGATIVE",
  INCONCLUSIVE: "UNDETERMINED",
};

export const TEST_RESULT_VALUES = {
  0: COVID_RESULTS.NEGATIVE,
  1: COVID_RESULTS.POSITIVE,
  2: COVID_RESULTS.INCONCLUSIVE,
};

export const TEST_RESULT_DESCRIPTIONS = {
  NEGATIVE: "Negative",
  POSITIVE: "Positive",
  UNDETERMINED: "Inconclusive",
};

export const RACE_VALUES: { value: Race; label: string }[] = [
  {
    value: "native",
    label: "American Indian or Alaskan Native",
  },
  {
    value: "asian",
    label: "Asian",
  },
  {
    value: "black",
    label: "Black or African American",
  },
  {
    value: "pacific",
    label: "Native Hawaiian or other Pacific Islander",
  },
  {
    value: "white",
    label: "White",
  },
  {
    value: "unknown",
    label: "Unknown",
  },
  {
    value: "refused",
    label: "Refused to answer",
  },
];

export const ROLE_VALUES: { value: Role; label: string }[] = [
  { label: "Staff", value: "STAFF" },
  { label: "Resident", value: "RESIDENT" },
  { label: "Student", value: "STUDENT" },
  { label: "Visitor", value: "VISITOR" },
];

export const ETHNICITY_VALUES: { value: Ethnicity; label: string }[] = [
  { label: "Hispanic or Latino", value: "hispanic" },
  { label: "Not Hispanic", value: "not_hispanic" },
];
export const GENDER_VALUES: { value: Gender; label: string }[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

export const YES_NO_VALUES: { value: YesNo; label: string }[] = [
  { label: "Yes", value: "YES" },
  { label: "No", value: "NO" },
];
