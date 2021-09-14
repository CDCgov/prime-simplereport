/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetResultsCountByFacility
// ====================================================

export interface GetResultsCountByFacility {
  testResultsCount: number | null;
}

export interface GetResultsCountByFacilityVariables {
  facilityId?: string | null;
  patientId?: string | null;
  result?: string | null;
  role?: string | null;
  startDate?: any | null;
  endDate?: any | null;
}
