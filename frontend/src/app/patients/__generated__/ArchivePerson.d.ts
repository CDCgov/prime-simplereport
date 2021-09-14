/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ArchivePerson
// ====================================================

export interface ArchivePerson_setPatientIsDeleted {
  __typename: "Patient";
  internalId: string | null;
}

export interface ArchivePerson {
  setPatientIsDeleted: ArchivePerson_setPatientIsDeleted | null;
}

export interface ArchivePersonVariables {
  id: string;
  deleted: boolean;
}
