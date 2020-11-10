import { TEST_RESULT__SUBMIT } from "./testResultActionTypes";

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TEST_RESULT__SUBMIT:
      const { patientId, ...newTestResult } = { ...action.payload };
      const allTestResults = state[patientId] ? [...state[patientId]] : [];
      allTestResults.push(newTestResult);
      return {
        ...state,
        [patientId]: allTestResults,
      };
    default:
      return state;
  }
};
