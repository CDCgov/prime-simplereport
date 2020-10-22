import { createSelector } from "reselect";

import { displayFullName } from "../utils";
import { getPatients } from "../patients/patientSelectors";

const getPatientsInTestQueue = (state) => state.testQueue.patients;

// returns an array of patientIds that are in the test queue
// also sorts patients from oldest to newst
// ie: [patientID1, patientId3, patientId4]
const getPatientIdsInTestQueue = createSelector(
  getPatientsInTestQueue,
  (patients) => {
    return Object.keys(patients)
      .filter(
        (patientId) => patients[patientId] && patients[patientId].isInQueue
      )
      .sort((a, b) => patients[a].added - patients[b].added);
  }
);

// returns a subset of patient fields, including the queue status, for *ALL* patients
// used for searching patients to add to the queue
export const getAllPatientsWithQueueStatus = createSelector(
  getPatients,
  getPatientsInTestQueue,
  (patients, testQueuePatients) => {
    const patientQueueSearchItems = Object.values(patients).map((patient) => {
      let { firstName, middleName, lastName, birthDate, patientId } = {
        ...patient,
      };
      let isInQueue =
        testQueuePatients[patientId] && testQueuePatients[patientId].isInQueue;
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
export const getDetailedPatientsInTestQueue = createSelector(
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

export const getQueueNotification = (state) => state.testQueue.notifications;
