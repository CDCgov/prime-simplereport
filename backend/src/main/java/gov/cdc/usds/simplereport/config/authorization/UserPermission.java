package gov.cdc.usds.simplereport.config.authorization;

import java.security.Principal;

/**
 * Permissions that a user may hold, usually via their {@link OrganizationRole}.
 *
 * <p>DO: Keep updated with UserPermission in schema.graphqls
 */
public enum UserPermission implements Principal {
  READ_PATIENT_LIST,
  READ_ARCHIVED_PATIENT_LIST,
  SEARCH_PATIENTS,
  READ_RESULT_LIST,
  EDIT_PATIENT,
  ARCHIVE_PATIENT,
  EDIT_FACILITY,
  EDIT_ORGANIZATION,
  MANAGE_USERS,
  START_TEST,
  UPDATE_TEST,
  SUBMIT_TEST,
  EXPORT_TEST_EVENT,
  ACCESS_ALL_FACILITIES;

  @Override
  public String getName() {
    return name();
  }
}
