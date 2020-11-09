import moment from "moment";
import {
  TEST_QUEUE__ADD_PATIENT,
  TEST_QUEUE__REMOVE_PATIENT,
  TEST_QUEUE__UPDATE_PATIENT,
  TEST_QUEUE__SHOW_NOTIFICATION,
  TEST_QUEUE__CLEAR_NOTIFICATION,
} from "./testQueueActionTypes";

import { QUEUE_NOTIFICATION_TYPES } from "../constants";

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

export const addToQueueNotification = (notificationType, patientId) => {
  return {
    type: TEST_QUEUE__SHOW_NOTIFICATION,
    payload: {
      notificationType,
      patientId,
    },
  };
};

export const clearNotification = () => {
  return {
    type: TEST_QUEUE__CLEAR_NOTIFICATION,
  };
};

export const addPatientToQueue = (patientId, aoeAnswers) => {
  return (dispatch) => {
    // Step 1: inform that a patient is being added the queue
    // TODO

    // Step 2: do the addition
    dispatch(_addPatientToQueue(patientId, aoeAnswers));

    // step 3: do the notification (TODO: this may need to be async if adding to the queue is backed up in the db)
    dispatch(
      addToQueueNotification(
        QUEUE_NOTIFICATION_TYPES.ADDED_TO_QUEUE__SUCCESS,
        patientId
      )
    );
  };
};

export const updatePatientInQueue = (
  patientId,
  aoeAnswers,
  deviceId,
  testResult
) => {
  return (dispatch) =>
    dispatch({
      type: TEST_QUEUE__UPDATE_PATIENT,
      payload: {
        patientId,
        dateUpdated: moment().toISOString(),
        askOnEntry: aoeAnswers,
        deviceId,
        testResult,
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
