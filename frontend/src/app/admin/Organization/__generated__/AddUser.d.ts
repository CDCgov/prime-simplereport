/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Role } from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: AddUser
// ====================================================

export interface AddUser_addUser_name {
  __typename: "NameInfo";
  firstName: string | null;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
}

export interface AddUser_addUser_organization_facilities {
  __typename: "Facility";
  name: string | null;
  id: string | null;
}

export interface AddUser_addUser_organization {
  __typename: "Organization";
  name: string | null;
  externalId: string | null;
  facilities: AddUser_addUser_organization_facilities[];
}

export interface AddUser_addUser {
  __typename: "User";
  id: string | null;
  name: AddUser_addUser_name | null;
  email: string;
  role: Role | null;
  organization: AddUser_addUser_organization | null;
}

export interface AddUser {
  addUser: AddUser_addUser | null;
}

export interface AddUserVariables {
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  suffix?: string | null;
  email: string;
  organizationExternalId: string;
  role: Role;
}
