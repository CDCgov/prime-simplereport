import { TEST_QUEUE__ADD_PATIENT } from "./testQueueActionTypes";

export const addPatientToQueue = (patientId) => {
  return {
    type: TEST_QUEUE__ADD_PATIENT,
    payload: {
      patientId,
    },
  };
};
