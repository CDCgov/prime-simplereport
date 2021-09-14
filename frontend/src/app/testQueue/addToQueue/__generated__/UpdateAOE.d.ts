/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TestResultDeliveryPreference } from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateAOE
// ====================================================

export interface UpdateAOE {
  updateTimeOfTestQuestions: string | null;
}

export interface UpdateAOEVariables {
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
