import {
  TEST_QUEUE__ADD_PATIENT,
  TEST_QUEUE__REMOVE_PATIENT,
} from "./testQueueActionTypes";

export default (state = [], action) => {
  switch (action.type) {
    case TEST_QUEUE__ADD_PATIENT:
      return [...state, action.payload.patientId];
    case TEST_QUEUE__REMOVE_PATIENT:
      let newState = [];
      state.forEach((patientId) => {
        if (patientId != action.payload.patientId) {
          newState.push(patientId);
        }
      });
      return newState;
    default:
      return state;
  }
};
