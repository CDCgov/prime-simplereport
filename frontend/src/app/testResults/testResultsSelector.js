import { createSelector } from "reselect";
import { getPatients } from "../patients/patientSelectors";
import { displayFullName } from "../utils";
export const getTestResults = (state) => state.testResults;

export const getTestResultById = (patientId) =>
  createSelector(getTestResults, (testResults) => testResults[patientId]);

export const getTestResultsWithPatientDetails = createSelector(
  getTestResults,
  getPatients,
  (testResults, patients) => {
    let patientsWithDetails = [];

    // TODO: ugh nested for loops...
    // TODO: this might violate redux best practices of having a flat store, but consider putting `state.testResults[patientId]` within `state.patients[patientId].testResults`
    Object.entries(testResults).forEach(([patientId, patientTestResults]) => {
      let { firstName, middleName, lastName } = {
        ...patients[patientId],
      };
      return patientTestResults.forEach((testResult) => {
        patientsWithDetails.push({
          displayName: displayFullName(firstName, middleName, lastName),
          patientId,
          ...testResult,
        });
      });
    });
    return patientsWithDetails;
  }
);
