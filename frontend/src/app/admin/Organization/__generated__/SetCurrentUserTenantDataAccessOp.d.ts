/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  UserPermission,
  Role,
} from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: SetCurrentUserTenantDataAccessOp
// ====================================================

export interface SetCurrentUserTenantDataAccessOp_setCurrentUserTenantDataAccess_organization {
  __typename: "Organization";
  name: string | null;
  externalId: string | null;
}

export interface SetCurrentUserTenantDataAccessOp_setCurrentUserTenantDataAccess {
  __typename: "User";
  id: string | null;
  email: string;
  permissions: UserPermission[];
  role: Role | null;
  organization: SetCurrentUserTenantDataAccessOp_setCurrentUserTenantDataAccess_organization | null;
}

export interface SetCurrentUserTenantDataAccessOp {
  setCurrentUserTenantDataAccess: SetCurrentUserTenantDataAccessOp_setCurrentUserTenantDataAccess | null;
}

export interface SetCurrentUserTenantDataAccessOpVariables {
  organizationExternalId?: string | null;
  justification?: string | null;
}
