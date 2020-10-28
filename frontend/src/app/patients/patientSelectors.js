import { createSelector } from "reselect";
import { getTestResults } from "../testResults/testResultsSelector";
import { displayFullName } from "../utils";
import moment from "moment";
var _ = require("lodash");

export const getPatients = (state) => state.patients;

export const getPatientsWithLastTestResult = (state) =>
  createSelector(getPatients, getTestResults, (patients, testResults) => {
    return Object.entries(patients).map(([patientId, patient]) => {
      let { firstName, middleName, lastName } = { ...patient };
      let patientWithData = {
        ...patient,
        displayName: displayFullName(firstName, middleName, lastName),
      };
      if (testResults[patientId]) {
        let testResultDates = testResults[patientId].map((testResult) =>
          moment(testResult.dateTested)
        );

        let daysSinceMostRecentTestResult = moment().diff(
          moment.max(testResultDates),
          "days"
        );
        patientWithData.lastTestDate = daysSinceMostRecentTestResult;
      }
      return patientWithData;
    });
  });

// gets a single patient by its id
export const getPatientById = (patientId) =>
  createSelector(getPatients, (patients) => patients[patientId] || null);

// gets multiple patients given an array of patientIds
export const getPatientsByIds = (patientIds) =>
  createSelector(getPatients, (patients) => _.pick(patients, patientIds));
