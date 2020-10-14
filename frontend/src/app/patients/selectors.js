import { createSelector } from "reselect";

export const getPatients = (state) => state.patients;

export const getPatient = (patientId) =>
  createSelector(getPatients, (patients) => patients[patientId]);
