type UserType = "standard" | "restricted" | "admin";

type UserPermission =
  | "read_patient_list"
  | "read_result_list"
  | "edit_patient"
  | "edit_facility"
  | "edit_organization"
  | "start_test"
  | "update_test"
  | "submit_test";
