/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: PatientExists
// ====================================================

export interface PatientExists {
  patientExists: boolean | null;
}

export interface PatientExistsVariables {
  firstName: string;
  lastName: string;
  birthDate: any;
  zipCode: string;
  facilityId?: string | null;
}
