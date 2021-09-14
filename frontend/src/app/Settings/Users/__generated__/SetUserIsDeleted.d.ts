/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SetUserIsDeleted
// ====================================================

export interface SetUserIsDeleted_setUserIsDeleted {
  __typename: "User";
  id: string | null;
}

export interface SetUserIsDeleted {
  setUserIsDeleted: SetUserIsDeleted_setUserIsDeleted | null;
}

export interface SetUserIsDeletedVariables {
  id: string;
  deleted: boolean;
}
