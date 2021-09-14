/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetUnverifiedOrganizations
// ====================================================

export interface GetUnverifiedOrganizations_organizations {
  __typename: "Organization";
  id: string | null;
  name: string | null;
  externalId: string | null;
  identityVerified: boolean | null;
}

export interface GetUnverifiedOrganizations {
  organizations: GetUnverifiedOrganizations_organizations[];
}

export interface GetUnverifiedOrganizationsVariables {
  identityVerified?: boolean | null;
}
