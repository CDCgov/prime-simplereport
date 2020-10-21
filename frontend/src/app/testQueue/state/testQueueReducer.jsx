import {
  TEST_QUEUE__ADD_PATIENT,
  TEST_QUEUE__REMOVE_PATIENT,
  TEST_QUEUE__SHOW_NOTIFICATION,
  TEST_QUEUE__CLEAR_NOTIFICATION,
} from "./testQueueActionTypes";
import moment from "moment";

export default (state = {}, action) => {
  switch (action.type) {
    case TEST_QUEUE__ADD_PATIENT: {
      const patientId = action.payload.patientId;
      return {
        ...state,
        [patientId]: {
          isInQueue: true,
          added: moment(),
        },
      };
    }
    case TEST_QUEUE__REMOVE_PATIENT: {
      const patientId = action.payload.patientId;
      let newQueue = {
        ...state,
      };
      delete newQueue[patientId];
      return newQueue;
    }
    case TEST_QUEUE__SHOW_NOTIFICATION: {
      const { notificationType, patientId } = { ...action.payload };
      return {
        ...state,
        notification: {
          notificationType,
          patientId,
        },
      };
    }
    case TEST_QUEUE__CLEAR_NOTIFICATION: {
      return {
        ...state,
        notification: {},
      };
    }
    default:
      return state;
  }
};
