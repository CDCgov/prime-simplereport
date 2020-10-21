import {
  TEST_QUEUE__ADD_PATIENT,
  TEST_QUEUE__REMOVE_PATIENT,
} from "./testQueueActionTypes";
import moment from "moment";

export default (state = {}, action) => {
  let patientId;
  switch (action.type) {
    case TEST_QUEUE__ADD_PATIENT:
      patientId = action.payload.patientId;
      return {
        ...state,
        [patientId]: {
          isInQueue: true,
          added: moment(),
          removed: null,
        },
      };
    case TEST_QUEUE__REMOVE_PATIENT:
      patientId = action.payload.patientId;
      return {
        ...state,
        [patientId]: {
          ...state[patientId],
          isInQueue: false,
          removed: moment(),
        },
      };
    default:
      return state;
  }
};
