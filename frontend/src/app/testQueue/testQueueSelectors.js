import { createSelector } from "reselect";

import { displayFullName } from "../utils";
import { getPatients } from "../patients/patientSelectors";

export const getTestQueue = (state) => state.testQueue;

// returns an array of patientIds that are in the test queue
// also sorts patients from oldest to newst
// ie: [patientID1, patientId3, patientId4]
export const getPatientIdsInTestQueue = createSelector(
  getTestQueue,
  (testQueue) => {
    return Object.keys(testQueue)
      .filter(
        (patientId) => testQueue[patientId] && testQueue[patientId].isInQueue
      )
      .sort((a, b) => testQueue[a].added - testQueue[b].added);
  }
);

// returns a subset of patient fields, including the queue status, for *ALL* patients
// used for searching patients to add to the queue
export const getAllPatientsWithQueueStatus = createSelector(
  getPatients,
  getTestQueue,
  (patients, testQueue) => {
    const patientQueueSearchItems = Object.values(patients).map((patient) => {
      let { firstName, middleName, lastName, birthDate, patientId } = {
        ...patient,
      };
      let isInQueue = testQueue[patientId] && testQueue[patientId].isInQueue;
      return {
        displayName: displayFullName(firstName, middleName, lastName),
        birthDate,
        patientId,
        isInQueue,
      };
    });
    return patientQueueSearchItems;
  }
);

// fetches patients in the queue
export const getPatientsInTestQueue = createSelector(
  getPatientIdsInTestQueue,
  getPatients,
  (testQueuePatientIds, allPatients) => {
    let patientsInQueue = [];
    testQueuePatientIds.forEach((patientId) =>
      patientsInQueue.push(allPatients[patientId])
    );
    return patientsInQueue;
  }
);

export const getQueueNotification = (state) => state.testQueue.notification;
