/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum PhoneType {
  LANDLINE = "LANDLINE",
  MOBILE = "MOBILE",
}

export enum Role {
  ADMIN = "ADMIN",
  ENTRY_ONLY = "ENTRY_ONLY",
  USER = "USER",
}

export enum TestResultDeliveryPreference {
  NONE = "NONE",
  SMS = "SMS",
}

export enum UserPermission {
  ACCESS_ALL_FACILITIES = "ACCESS_ALL_FACILITIES",
  ARCHIVE_PATIENT = "ARCHIVE_PATIENT",
  EDIT_FACILITY = "EDIT_FACILITY",
  EDIT_ORGANIZATION = "EDIT_ORGANIZATION",
  EDIT_PATIENT = "EDIT_PATIENT",
  MANAGE_USERS = "MANAGE_USERS",
  READ_ARCHIVED_PATIENT_LIST = "READ_ARCHIVED_PATIENT_LIST",
  READ_PATIENT_LIST = "READ_PATIENT_LIST",
  READ_RESULT_LIST = "READ_RESULT_LIST",
  SEARCH_PATIENTS = "SEARCH_PATIENTS",
  START_TEST = "START_TEST",
  SUBMIT_TEST = "SUBMIT_TEST",
  UPDATE_TEST = "UPDATE_TEST",
}

export interface PhoneNumberInput {
  type?: string | null;
  number?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
