// import { getTestResult } from "../../query/testResults";
import {
  // TEST_RESULT__REQUEST,
  // TEST_RESULT__RECEIVED,
  TEST_RESULT__SUBMIT,
} from "./testResultActionTypes";

// used to signal that a request is being made
// const requestTestResult = (patientId) => {
//   return {
//     type: TEST_RESULT__REQUEST,
//     payload: patientId,
//   };
// };

// const receivedTestResult = (patientId, testResult) => {
//   return {
//     type: TEST_RESULT__RECEIVED,
//     payload: {
//       testResult,
//       patientId,
//     },
//   };
// };

export const submitTestResult = (patientId, testResultInfo) => {
  return {
    type: TEST_RESULT__SUBMIT,
    payload: {
      patientId,
      deviceId: testResultInfo.deviceId,
      result: testResultInfo.testResultValue,
    },
  };
};

// export const loadTestResult = (patientId) => {
//   return (dispatch) => {
//     // first, inform that the API call is starting
//     dispatch(requestTestResult(patientId));

//     // return a promise
//     return getTestResult(patientId).then((testResult) => {
//       console.log("test result from dispatch", testResult);
//       dispatch(receivedTestResult(testResult, patientId));
//       // TODO: you need to update the patient with patientId to store the testResult. We currently have no way of getting the testResult given a patientId
//     });
//   };
// };
