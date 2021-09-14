/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPatientsByFacility
// ====================================================

export interface GetPatientsByFacility_patients_lastTest {
  __typename: "TestResult";
  dateAdded: string | null;
}

export interface GetPatientsByFacility_patients {
  __typename: "Patient";
  internalId: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  birthDate: any | null;
  isDeleted: boolean | null;
  role: string | null;
  lastTest: GetPatientsByFacility_patients_lastTest | null;
}

export interface GetPatientsByFacility {
  patients: (GetPatientsByFacility_patients | null)[] | null;
}

export interface GetPatientsByFacilityVariables {
  facilityId: string;
  pageNumber: number;
  pageSize: number;
  showDeleted?: boolean | null;
  namePrefixMatch?: string | null;
}
