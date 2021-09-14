/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetFacilityResults
// ====================================================

export interface GetFacilityResults_testResults_deviceType {
  __typename: "DeviceType";
  internalId: string | null;
  name: string | null;
}

export interface GetFacilityResults_testResults_patient {
  __typename: "Patient";
  internalId: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  birthDate: any | null;
  gender: string | null;
  lookupId: string | null;
}

export interface GetFacilityResults_testResults_createdBy_nameInfo {
  __typename: "NameInfo";
  firstName: string | null;
  middleName: string | null;
  lastName: string;
}

export interface GetFacilityResults_testResults_createdBy {
  __typename: "ApiUser";
  nameInfo: GetFacilityResults_testResults_createdBy_nameInfo | null;
}

export interface GetFacilityResults_testResults_patientLink {
  __typename: "PatientLink";
  internalId: string | null;
}

export interface GetFacilityResults_testResults {
  __typename: "TestResult";
  internalId: string | null;
  dateTested: any | null;
  result: string | null;
  correctionStatus: string | null;
  deviceType: GetFacilityResults_testResults_deviceType | null;
  patient: GetFacilityResults_testResults_patient | null;
  createdBy: GetFacilityResults_testResults_createdBy | null;
  patientLink: GetFacilityResults_testResults_patientLink | null;
  symptoms: string | null;
  noSymptoms: boolean | null;
}

export interface GetFacilityResults {
  testResults: (GetFacilityResults_testResults | null)[] | null;
}

export interface GetFacilityResultsVariables {
  facilityId?: string | null;
  patientId?: string | null;
  result?: string | null;
  role?: string | null;
  startDate?: any | null;
  endDate?: any | null;
  pageNumber?: number | null;
  pageSize?: number | null;
}
