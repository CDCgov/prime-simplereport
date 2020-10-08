import {
  TEST_RESULT__REQUEST,
  TEST_RESULT__RECEIVED,
} from "../actions/testResult";

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TEST_RESULT__REQUEST:
      return {
        ...state,
      };
    case TEST_RESULT__RECEIVED:
      const testResultId = action.payload.testResultId;
      return {
        ...state,
        [testResultId]: {
          ...state[testResultId],
          ...action.payload,
        },
      };
    default:
      return state;
  }
};
