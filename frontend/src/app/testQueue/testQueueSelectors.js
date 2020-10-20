import { createSelector } from "reselect";

import { displayFullName } from "../utils";
import { getPatients } from "../patients/patientSelectors";

const getTestQueue = (state) => state.testQueue;

export const getPatientsInTestQueue = (state) => {
  return Object.keys(state.testQueue).filter(
    (patientId) => state.testQueue[patientId]
  );
};

// note: this just fetches all patients in the state, which can be bulky if there are lots of patients (probably several thousand?)
export const patientSearch = createSelector(
  getPatients,
  getTestQueue,
  (patients, testQueue) => {
    const patientQueueSearchItems = Object.values(patients).map((patient) => {
      let { firstName, middleName, lastName, birthDate, patientId } = {
        ...patient,
      };
      return {
        name: displayFullName(firstName, middleName, lastName),
        birthDate,
        patientId,
        isInQueue: testQueue[patientId],
      };
    });
    return patientQueueSearchItems;
  }
);
