/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getTestResultForCorrection
// ====================================================

export interface getTestResultForCorrection_testResult_deviceType {
  __typename: "DeviceType";
  name: string | null;
}

export interface getTestResultForCorrection_testResult_patient {
  __typename: "Patient";
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  birthDate: any | null;
}

export interface getTestResultForCorrection_testResult {
  __typename: "TestResult";
  dateTested: any | null;
  result: string | null;
  correctionStatus: string | null;
  deviceType: getTestResultForCorrection_testResult_deviceType | null;
  patient: getTestResultForCorrection_testResult_patient | null;
}

export interface getTestResultForCorrection {
  testResult: getTestResultForCorrection_testResult | null;
}

export interface getTestResultForCorrectionVariables {
  id: string;
}
