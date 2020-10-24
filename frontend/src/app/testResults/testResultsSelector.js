import { createSelector } from "reselect";

export const getTestResults = (state) => state.testResults;

export const getTestResultById = (patientId) =>
  createSelector(getTestResults, (testResults) => testResults[patientId]);
