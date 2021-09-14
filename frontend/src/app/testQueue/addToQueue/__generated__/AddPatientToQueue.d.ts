/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TestResultDeliveryPreference } from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: AddPatientToQueue
// ====================================================

export interface AddPatientToQueue {
  addPatientToQueue: string | null;
}

export interface AddPatientToQueueVariables {
  facilityId: string;
  patientId: string;
  symptoms?: string | null;
  symptomOnset?: any | null;
  pregnancy?: string | null;
  firstTest?: boolean | null;
  priorTestDate?: any | null;
  priorTestType?: string | null;
  priorTestResult?: string | null;
  noSymptoms?: boolean | null;
  testResultDelivery?: TestResultDeliveryPreference | null;
}
