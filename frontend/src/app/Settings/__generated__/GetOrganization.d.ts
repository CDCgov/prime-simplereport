/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetOrganization
// ====================================================

export interface GetOrganization_organization {
  __typename: "Organization";
  name: string | null;
  type: string | null;
}

export interface GetOrganization {
  organization: GetOrganization_organization | null;
}
