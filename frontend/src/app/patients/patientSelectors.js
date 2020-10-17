import { createSelector } from "reselect";
var _ = require("lodash");

export const getPatients = (state) => state.patients;

// gets a single patient by its id
export const getPatientById = (patientId) =>
  createSelector(getPatients, (patients) => patients[patientId]);

// gets multiple patients given an array of patientIds
export const getPatientsByIds = (patientIds) =>
  createSelector(getPatients, (patients) => _.pick(patients, patientIds));
