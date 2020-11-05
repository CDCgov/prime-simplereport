import { createSelector } from "reselect";

import { displayFullName } from "../utils";
import { getPatients } from "../patients/patientSelectors";

const _getPatientsInTestQueue = (state) => state.testQueue.patients;
export const getQueueNotification = (state) => state.testQueue.notifications;

// returns an array of patientIds that are in the test queue
// also sorts patients from oldest to newest
const _getPatientIdsInTestQueue = createSelector(
  _getPatientsInTestQueue,
  (patients) => {
    return Object.keys(patients).sort(
      (a, b) => patients[a].dateAdded - patients[b].dateAdded
    );
  }
);

// returns a subset of patient fields, including the queue status, for *ALL* patients
// used for searching patients to add to the queue
export const getAllPatientsWithQueueStatus = createSelector(
  getPatients,
  _getPatientsInTestQueue,
  (allPatients, testQueuePatients) => {
    const patientQueueSearchItems = Object.values(allPatients).map(
      (patient) => {
        let { firstName, middleName, lastName, birthDate, patientId } = {
          ...patient,
        };
        return {
          displayName: displayFullName(firstName, middleName, lastName),
          birthDate,
          patientId,
          isInQueue: patientId in testQueuePatients,
        };
      }
    );
    return patientQueueSearchItems;
  }
);

// fetches the entire patient model for each patient in the queue
// used to render each item in the queue
export const getDetailedPatientsInTestQueue = createSelector(
  _getPatientIdsInTestQueue,
  getPatients,
  (testQueuePatientIds, allPatients) => {
    let patientsInQueue = [];
    testQueuePatientIds.forEach((patientId) =>
      patientsInQueue.push(allPatients[patientId])
    );
    return patientsInQueue;
  }
);
