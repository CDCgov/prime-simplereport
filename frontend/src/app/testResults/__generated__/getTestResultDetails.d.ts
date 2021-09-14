/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getTestResultDetails
// ====================================================

export interface getTestResultDetails_testResult_deviceType {
  __typename: "DeviceType";
  name: string | null;
}

export interface getTestResultDetails_testResult_patient {
  __typename: "Patient";
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  birthDate: any | null;
}

export interface getTestResultDetails_testResult_createdBy_name {
  __typename: "NameInfo";
  firstName: string | null;
  middleName: string | null;
  lastName: string;
}

export interface getTestResultDetails_testResult_createdBy {
  __typename: "ApiUser";
  name: getTestResultDetails_testResult_createdBy_name;
}

export interface getTestResultDetails_testResult {
  __typename: "TestResult";
  dateTested: any | null;
  result: string | null;
  correctionStatus: string | null;
  symptoms: string | null;
  symptomOnset: any | null;
  pregnancy: string | null;
  deviceType: getTestResultDetails_testResult_deviceType | null;
  patient: getTestResultDetails_testResult_patient | null;
  createdBy: getTestResultDetails_testResult_createdBy | null;
}

export interface getTestResultDetails {
  testResult: getTestResultDetails_testResult | null;
}

export interface getTestResultDetailsVariables {
  id: string;
}
