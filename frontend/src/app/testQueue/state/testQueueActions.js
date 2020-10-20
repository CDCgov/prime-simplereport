import {
  TEST_QUEUE__ADD_PATIENT,
  TEST_QUEUE__REMOVE_PATIENT,
} from "./testQueueActionTypes";

export const addPatientToQueue = (patientId) => {
  return {
    type: TEST_QUEUE__ADD_PATIENT,
    payload: {
      patientId,
    },
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
