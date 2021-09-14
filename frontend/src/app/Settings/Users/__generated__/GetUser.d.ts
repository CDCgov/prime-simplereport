/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  Role,
  UserPermission,
} from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetUser
// ====================================================

export interface GetUser_user_organization_testingFacility {
  __typename: "Facility";
  id: string | null;
  name: string | null;
}

export interface GetUser_user_organization {
  __typename: "Organization";
  testingFacility: (GetUser_user_organization_testingFacility | null)[] | null;
}

export interface GetUser_user {
  __typename: "User";
  id: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string;
  roleDescription: string;
  role: Role | null;
  permissions: UserPermission[];
  email: string;
  status: string | null;
  organization: GetUser_user_organization | null;
}

export interface GetUser {
  user: GetUser_user | null;
}

export interface GetUserVariables {
  id: string;
}
