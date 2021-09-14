/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPatientsLastResult
// ====================================================

export interface GetPatientsLastResult_patient_lastTest {
  __typename: "TestResult";
  dateTested: any | null;
  result: string | null;
}

export interface GetPatientsLastResult_patient {
  __typename: "Patient";
  lastTest: GetPatientsLastResult_patient_lastTest | null;
}

export interface GetPatientsLastResult {
  patient: GetPatientsLastResult_patient | null;
}

export interface GetPatientsLastResultVariables {
  patientId: string;
}
