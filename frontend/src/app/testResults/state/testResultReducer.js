import {
  TEST_RESULT__REQUEST,
  TEST_RESULT__RECEIVED,
  TEST_RESULT__SUBMIT,
} from "./testResultActionTypes";

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TEST_RESULT__REQUEST:
      return state;
    case TEST_RESULT__RECEIVED:
      const testResultId = action.payload.testResult.testResultId;
      return {
        ...state,
        [testResultId]: {
          ...state[testResultId],
          ...action.payload.testResult,
        },
      };
    case TEST_RESULT__SUBMIT:
      const { patientId, deviceId, testResult } = { ...action.payload };
      return {
        ...state,
        [patientId]: {
          testResult,
          deviceId,
        },
      };
    default:
      return state;
  }
};
