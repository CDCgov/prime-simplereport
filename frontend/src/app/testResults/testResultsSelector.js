import { createSelector } from "reselect";

export const getTestResults = (state) => state.testResults;

export const getTestResultById = (testResultId) =>
  createSelector(getTestResults, (testResults) => testResults[testResultId]);
