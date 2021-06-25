import { AlertContent } from "../commonComponents/Alert";
import { displayFullName } from "../utils";

export const QUEUE_NOTIFICATION_TYPES = {
  ADDED_TO_QUEUE__SUCCESS: 1,
  SUBMITTED_RESULT__SUCCESS: 2,
};

export const ALERT_CONTENT = {
  [QUEUE_NOTIFICATION_TYPES.ADDED_TO_QUEUE__SUCCESS]: (
    patient: any
  ): AlertContent => {
    return {
      type: "success",
      title: `${displayFullName(
        patient.firstName,
        patient.middleName,
        patient.lastName
      )} was added to the queue`,
      body: "Newly added patients go to the bottom of the queue",
    };
  },
  [QUEUE_NOTIFICATION_TYPES.SUBMITTED_RESULT__SUCCESS]: (
    patient: any
  ): AlertContent => {
    return {
      type: "success",
      title: `Result was saved and reported for ${displayFullName(
        patient.firstName,
        patient.middleName,
        patient.lastName
      )}.`,
      body: "See results to review past test results",
    };
  },
};

export const MIN_SEARCH_CHARACTER_COUNT = 2;

export const SEARCH_DEBOUNCE_TIME = 500;
