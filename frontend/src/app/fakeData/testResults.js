import { COVID_RESULTS } from "../constants";

export const demoTestResults = [
  {
    testResultId: "testResult1",
    result: COVID_RESULTS.POSITIVE,
    patientId: "abc123",
  },
  {
    testResultId: "testResult2",
    result: null,
    patientId: "def456",
  },
  {
    testResultId: "testResult3",
    result: null,
    patientId: "ghi789",
  },
];

export const initialTestResultsState = {
  testResult1: {
    testResultId: "testResult1",
    result: COVID_RESULTS.POSITIVE,
    patientId: "abc123",
  },
  testResult2: {
    testResultId: "testResult2",
    result: null,
    patientId: "def456",
  },
  testResult3: {
    testResultId: "testResult3",
    result: null,
    patientId: "ghi789",
  },
};
