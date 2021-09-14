/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Role } from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateUserPrivileges
// ====================================================

export interface UpdateUserPrivileges_updateUserPrivileges {
  __typename: "User";
  id: string | null;
}

export interface UpdateUserPrivileges {
  updateUserPrivileges: UpdateUserPrivileges_updateUserPrivileges | null;
}

export interface UpdateUserPrivilegesVariables {
  id: string;
  role: Role;
  accessAllFacilities: boolean;
  facilities: string[];
}
