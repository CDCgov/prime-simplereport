import moment from "moment";
import {
  TEST_QUEUE__ADD_PATIENT,
  TEST_QUEUE__REMOVE_PATIENT,
  TEST_QUEUE__UPDATE_PATIENT,
} from "./testQueueActionTypes";

const _addPatientToQueue = (patientId, aoeAnswers) => {
  return {
    type: TEST_QUEUE__ADD_PATIENT,
    payload: {
      patientId,
      dateAdded: moment().toISOString(),
      askOnEntry: aoeAnswers,
    },
  };
};

export const addPatientToQueue = (patientId, aoeAnswers) => {
  return (dispatch) => {
    // Step 1: inform that a patient is being added the queue
    // TODO

    // Step 2: do the addition
    dispatch(_addPatientToQueue(patientId, aoeAnswers));
  };
};

export const updatePatientInQueue = (patientId, aoeAnswers) => {
  return (dispatch) =>
    dispatch({
      type: TEST_QUEUE__UPDATE_PATIENT,
      payload: {
        patientId,
        dateUpdated: moment().toISOString(),
        askOnEntry: aoeAnswers,
      },
    });
};

export const removePatientFromQueue = (patientId) => {
  return {
    type: TEST_QUEUE__REMOVE_PATIENT,
    payload: {
      patientId,
    },
  };
};
