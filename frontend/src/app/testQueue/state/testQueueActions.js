import moment from "moment";
import {
  TEST_QUEUE__ADD_PATIENT,
  TEST_QUEUE__REMOVE_PATIENT,
} from "./testQueueActionTypes";

import { addNotification } from "../../Notifications/state/notificationActions";

import { QUEUE_NOTIFICATION_TYPES, ALERT_CONTENT } from "../constants";

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

    // step 3: do the notification (TODO: this may need to be async if adding to the queue is backed up in the db)
    let { type, title, body } = {
      ...ALERT_CONTENT[QUEUE_NOTIFICATION_TYPES.ADDED_TO_QUEUE__SUCCESS](
        patient
      ),
    };

    dispatch(addNotification(type, title, body, 5000));
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
