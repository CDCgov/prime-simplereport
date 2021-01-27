type UserType = "standard" | "restricted" | "admin";

type UserPermission =
  | "READ_PATIENT_LIST"
  | "READ_RESULT_LIST"
  | "EDIT_PATIENT"
  | "EDIT_FACILITY"
  | "EDIT_ORGANIZATION"
  | "START_TEST"
  | "UPDATE_TEST"
  | "SUBMIT_TEST";
