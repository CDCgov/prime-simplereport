import {
  // TEST_RESULT__REQUEST,
  // TEST_RESULT__RECEIVED,
  TEST_RESULT__SUBMIT,
} from "./testResultActionTypes";

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TEST_RESULT__SUBMIT:
      const { patientId, deviceId, result } = { ...action.payload };
      return {
        ...state,
        [patientId]: {
          result,
          deviceId,
        },
      };
    default:
      return state;
  }
};
