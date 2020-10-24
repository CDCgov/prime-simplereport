// import { getTestResult } from "../../query/testResults";
import {
  // TEST_RESULT__REQUEST,
  // TEST_RESULT__RECEIVED,
  TEST_RESULT__SUBMIT,
} from "./testResultActionTypes";

import {
  removePatientFromQueue,
  addToQueueNotification,
} from "../../testQueue/state/testQueueActions";

import { QUEUE_NOTIFICATION_TYPES } from "../../testQueue/constants";

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

const _submitTestResult = (patientId, testResultInfo) => {
  return {
    type: TEST_RESULT__SUBMIT,
    payload: {
      patientId,
      deviceId: testResultInfo.deviceId,
      result: testResultInfo.testResultValue,
    },
  };
};

// TODO: should the component call each of these actions, or should they be grouped in this one action
// Note: _submitTestResult will likely be an async action, as would removePatientFromQueue
export const submitTestResult = (patientId, testResultInfo) => {
  return (dispatch) => {
    dispatch(_submitTestResult(patientId, testResultInfo));
    dispatch(removePatientFromQueue(patientId));
    dispatch(
      addToQueueNotification(
        QUEUE_NOTIFICATION_TYPES.SUBMITTED_RESULT__SUCCESS,
        patientId
      )
    );
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
