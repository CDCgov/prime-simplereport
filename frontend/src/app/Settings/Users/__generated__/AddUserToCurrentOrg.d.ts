/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Role } from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: AddUserToCurrentOrg
// ====================================================

export interface AddUserToCurrentOrg_addUserToCurrentOrg {
  __typename: "User";
  id: string | null;
}

export interface AddUserToCurrentOrg {
  addUserToCurrentOrg: AddUserToCurrentOrg_addUserToCurrentOrg | null;
}

export interface AddUserToCurrentOrgVariables {
  firstName?: string | null;
  lastName: string;
  email: string;
  role: Role;
}
