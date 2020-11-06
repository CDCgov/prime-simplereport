import moment from "moment";

import { addNotification } from "../../Notifications/state/notificationActions";
import { ALERT_CONTENT } from "../../testQueue/constants";
import { QUEUE_NOTIFICATION_TYPES } from "../../testQueue/constants";
import { removePatientFromQueue } from "../../testQueue/state/testQueueActions";
import { TEST_RESULT__SUBMIT } from "./testResultActionTypes";

const _submitTestResult = (patientId, testResultInfo) => {
  return {
    type: TEST_RESULT__SUBMIT,
    payload: {
      patientId,
      deviceId: testResultInfo.deviceId,
      result: testResultInfo.testResultValue,
      dateTested: moment().toISOString(),
    },
  };
};

// TODO: should the component call each of these actions, or should they be grouped in this one action
// Note: _submitTestResult will likely be an async action, as would removePatientFromQueue
export const submitTestResult = (patient, testResultInfo) => {
  return (dispatch) => {
    let patientId = patient.patientId;
    dispatch(_submitTestResult(patientId, testResultInfo));
    dispatch(removePatientFromQueue(patientId));

    let { type, title, body } = {
      ...ALERT_CONTENT[QUEUE_NOTIFICATION_TYPES.SUBMITTED_RESULT__SUCCESS](
        patient
      ),
    };
    dispatch(addNotification(type, title, body, 3000));
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
