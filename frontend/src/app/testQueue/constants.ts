import { AlertContent } from "../commonComponents/Alert";
import { displayFullName } from "../utils";

export const QUEUE_NOTIFICATION_TYPES = {
  ADDED_TO_QUEUE__SUCCESS: 1,
  SUBMITTED_RESULT__SUCCESS: 2,
  DELIVERED_RESULT_TO_PATIENT__FAILURE: 3,
};

export type SomeoneWithName = {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
};

export const ALERT_CONTENT = {
  [QUEUE_NOTIFICATION_TYPES.ADDED_TO_QUEUE__SUCCESS]: <
    T extends SomeoneWithName
  >(
    patient: T,
    startWithLastName: boolean = true
  ): AlertContent => {
    return {
      type: "success",
      title: `${displayFullName(
        patient.firstName,
        patient.middleName,
        patient.lastName,
        startWithLastName
      )} was added to the queue`,
      body: "Newly added patients go to the bottom of the queue",
    };
  },
  [QUEUE_NOTIFICATION_TYPES.SUBMITTED_RESULT__SUCCESS]: <
    T extends SomeoneWithName
  >(
    patient: T,
    startWithLastName: boolean = true,
    dataRetentionLimitsEnabled: boolean = false
  ): AlertContent => {
    const resultText = dataRetentionLimitsEnabled
      ? "has been sent."
      : "was saved and reported.";
    return {
      type: "success",
      title: `Result for ${displayFullName(
        patient.firstName,
        patient.middleName,
        patient.lastName,
        startWithLastName
      )} ${resultText}`,
      body: "See Results to view all test submissions",
    };
  },
  [QUEUE_NOTIFICATION_TYPES.DELIVERED_RESULT_TO_PATIENT__FAILURE]: <
    T extends SomeoneWithName
  >(
    patient: T,
    startWithLastName: boolean = true
  ): AlertContent => {
    return {
      type: "error",
      title: `Unable to text result to ${displayFullName(
        patient.firstName,
        patient.middleName,
        patient.lastName,
        startWithLastName
      )}`,
      body: "The phone number provided may not be valid or may not be able to accept text messages",
    };
  },
};

export const MIN_SEARCH_CHARACTER_COUNT = 2;

export const SEARCH_DEBOUNCE_TIME = 500;
