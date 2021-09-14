/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetFacilitiesForManageUsers
// ====================================================

export interface GetFacilitiesForManageUsers_organization_testingFacility {
  __typename: "Facility";
  id: string | null;
  name: string | null;
}

export interface GetFacilitiesForManageUsers_organization {
  __typename: "Organization";
  testingFacility:
    | (GetFacilitiesForManageUsers_organization_testingFacility | null)[]
    | null;
}

export interface GetFacilitiesForManageUsers {
  organization: GetFacilitiesForManageUsers_organization | null;
}
