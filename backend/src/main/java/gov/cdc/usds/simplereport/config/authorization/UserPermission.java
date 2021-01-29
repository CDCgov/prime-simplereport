package gov.cdc.usds.simplereport.config.authorization;

/**
 * Permissions that a user may hold, usually via their {@link OrganizationRole}.
 */
public enum UserPermission {
    READ_PATIENT_LIST,
    SEARCH_PATIENTS,
    READ_RESULT_LIST,
    EDIT_PATIENT,
    EDIT_FACILITY,
    EDIT_ORGANIZATION,
    START_TEST,
    UPDATE_TEST,
    SUBMIT_TEST,
    EXPORT_TEST_EVENT;
}
