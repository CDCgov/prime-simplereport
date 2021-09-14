/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetUsersAndStatus
// ====================================================

export interface GetUsersAndStatus_usersWithStatus {
  __typename: "ApiUserWithStatus";
  id: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string;
  email: string;
  status: string | null;
}

export interface GetUsersAndStatus {
  usersWithStatus: (GetUsersAndStatus_usersWithStatus | null)[] | null;
}
