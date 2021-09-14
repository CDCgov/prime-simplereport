/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserPermission } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: WhoAmI
// ====================================================

export interface WhoAmI_whoami_organization_testingFacility {
  __typename: "Facility";
  id: string | null;
  name: string | null;
}

export interface WhoAmI_whoami_organization {
  __typename: "Organization";
  name: string | null;
  testingFacility: (WhoAmI_whoami_organization_testingFacility | null)[] | null;
}

export interface WhoAmI_whoami {
  __typename: "User";
  id: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  email: string;
  isAdmin: boolean | null;
  permissions: UserPermission[];
  roleDescription: string;
  organization: WhoAmI_whoami_organization | null;
}

export interface WhoAmI {
  whoami: WhoAmI_whoami;
}
