import { createSelector } from "reselect";

import { displayFullName } from "../utils";
import { getPatients } from "../patients/patientSelectors";

const _getPatientsInTestQueue = (state) => state.testQueue.patients;
export const getQueueNotification = (state) => state.testQueue.notifications;

// returns a superset of patient fields, including the queue status, for *ALL* patients
// used for searching patients to add to the queue
export const getAllPatientsWithQueueStatus = createSelector(
  getPatients,
  _getPatientsInTestQueue,
  (allPatients, testQueuePatients) => {
    const patientQueueSearchItems = Object.values(allPatients).map(
      (patient) => {
        let { firstName, middleName, lastName, patientId } = {
          ...patient,
        };
        return {
          ...patient,
          displayName: displayFullName(firstName, middleName, lastName),
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
  getPatients,
  _getPatientsInTestQueue,
  (patients, queue) => {
    return Object.keys(queue)
      .map((patientId) => ({
        ...queue[patientId],
        patient: patients[patientId],
      }))
      .sort((a, b) => (a.dateAdded < b.dateAdded ? -1 : 1));
  }
);
