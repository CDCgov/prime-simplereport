/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPatientsCountByFacility
// ====================================================

export interface GetPatientsCountByFacility {
  patientsCount: number | null;
}

export interface GetPatientsCountByFacilityVariables {
  facilityId: string;
  showDeleted: boolean;
  namePrefixMatch?: string | null;
}
