/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SubmitTestResult
// ====================================================

export interface SubmitTestResult_addTestResultNew_testResult {
  __typename: "TestOrder";
  internalId: string | null;
}

export interface SubmitTestResult_addTestResultNew {
  __typename: "AddTestResultResponse";
  testResult: SubmitTestResult_addTestResultNew_testResult;
  deliverySuccess: boolean | null;
}

export interface SubmitTestResult {
  addTestResultNew: SubmitTestResult_addTestResultNew | null;
}

export interface SubmitTestResultVariables {
  patientId: string;
  deviceId: string;
  result: string;
  dateTested?: any | null;
}
