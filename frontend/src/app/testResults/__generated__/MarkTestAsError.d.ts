/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: MarkTestAsError
// ====================================================

export interface MarkTestAsError_correctTestMarkAsError {
  __typename: "TestResult";
  internalId: string | null;
}

export interface MarkTestAsError {
  correctTestMarkAsError: MarkTestAsError_correctTestMarkAsError | null;
}

export interface MarkTestAsErrorVariables {
  id: string;
  reason: string;
}
