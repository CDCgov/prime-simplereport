import moment from "moment";
import {
  TEST_QUEUE__ADD_PATIENT,
  TEST_QUEUE__REMOVE_PATIENT,
} from "./testQueueActionTypes";

const _addPatientToQueue = (patientId) => {
  return {
    type: TEST_QUEUE__ADD_PATIENT,
    payload: {
      patientId,
      dateAdded: moment().toISOString(),
    },
  };
};

export const addPatientToQueue = (patient) => {
  return (dispatch) => {
    // Step 1: inform that a patient is being added the queue
    // TODO

    // Step 2: do the addition
    dispatch(_addPatientToQueue(patient.patientId));
  };
};

export const removePatientFromQueue = (patientId) => {
  return {
    type: TEST_QUEUE__REMOVE_PATIENT,
    payload: {
      patientId,
    },
  };
};
