import { getTestResult } from "../../query/testResult";

/*
convention: domain/event

examples: 
counter/incremenet
counter/decrement
counter/incrementByamount
*/

export const TEST_RESULT__REQUEST = "testResult/request";
export const TEST_RESULT__RECEIVED = "testResult/received";

// used to signal that a request is being made
export const requestTestResult = (patientId) => {
  return {
    type: TEST_RESULT__REQUEST,
    payload: patientId,
  };
};

export const receivedTestResult = (testResult) => {
  return {
    type: TEST_RESULT__RECEIVED,
    payload: testResult,
  };
};

export const loadTestResult = (patientId) => {
  return (dispatch) => {
    // first, inform that the API call is starting
    dispatch(requestTestResult(patientId));

    // return a promise
    return getTestResult(patientId).then((testResult) => {
      dispatch(receivedTestResult(testResult));
    });
  };
};
