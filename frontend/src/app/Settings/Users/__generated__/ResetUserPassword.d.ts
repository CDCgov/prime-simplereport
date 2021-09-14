/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ResetUserPassword
// ====================================================

export interface ResetUserPassword_resetUserPassword {
  __typename: "User";
  id: string | null;
}

export interface ResetUserPassword {
  resetUserPassword: ResetUserPassword_resetUserPassword | null;
}

export interface ResetUserPasswordVariables {
  id: string;
}
