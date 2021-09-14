/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getTestResultForPrint
// ====================================================

export interface getTestResultForPrint_testResult_deviceType {
  __typename: "DeviceType";
  name: string | null;
}

export interface getTestResultForPrint_testResult_patient {
  __typename: "Patient";
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  birthDate: any | null;
}

export interface getTestResultForPrint_testResult_facility_orderingProvider {
  __typename: "Provider";
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  NPI: string | null;
}

export interface getTestResultForPrint_testResult_facility {
  __typename: "Facility";
  name: string | null;
  cliaNumber: string | null;
  phone: string | null;
  street: string | null;
  streetTwo: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  orderingProvider: getTestResultForPrint_testResult_facility_orderingProvider | null;
}

export interface getTestResultForPrint_testResult_testPerformed {
  __typename: "TestDescription";
  name: string;
  loincCode: string;
}

export interface getTestResultForPrint_testResult {
  __typename: "TestResult";
  dateTested: any | null;
  result: string | null;
  correctionStatus: string | null;
  deviceType: getTestResultForPrint_testResult_deviceType | null;
  patient: getTestResultForPrint_testResult_patient | null;
  facility: getTestResultForPrint_testResult_facility | null;
  testPerformed: getTestResultForPrint_testResult_testPerformed;
}

export interface getTestResultForPrint {
  testResult: getTestResultForPrint_testResult | null;
}

export interface getTestResultForPrintVariables {
  id: string;
}
