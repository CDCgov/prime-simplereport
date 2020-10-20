import { TEST_QUEUE__ADD_PATIENT } from "./testQueueActionTypes";

export default (state = {}, action) => {
  switch (action.type) {
    case TEST_QUEUE__ADD_PATIENT:
      return {
        ...state,
        [action.payload.patientId]: true, // any value works here
      };
    default:
      return state;
  }
};
