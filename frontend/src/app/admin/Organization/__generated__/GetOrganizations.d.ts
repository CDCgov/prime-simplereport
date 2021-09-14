/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetOrganizations
// ====================================================

export interface GetOrganizations_organizations {
  __typename: "Organization";
  externalId: string | null;
  name: string | null;
}

export interface GetOrganizations {
  organizations: GetOrganizations_organizations[];
}

export interface GetOrganizationsVariables {
  identityVerified?: boolean | null;
}
