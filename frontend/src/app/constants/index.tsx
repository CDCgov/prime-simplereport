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
