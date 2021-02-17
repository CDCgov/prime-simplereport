package gov.cdc.usds.simplereport.config.authorization;

/**
 * Permissions that a user may hold, usually via their {@link OrganizationRole}.
 *
 * DO: Keep updated with UserPermission in schema.graphqls
 */
public enum UserPermission {
    READ_PATIENT_LIST,
    READ_PATIENT_INCL_DEL_LIST,
    SEARCH_PATIENTS,
    READ_RESULT_LIST,
    EDIT_PATIENT,
    DELETE_PATIENT,
    EDIT_FACILITY,
    EDIT_ORGANIZATION,
    MANAGE_USERS,
    START_TEST,
    UPDATE_TEST,
    SUBMIT_TEST,
    EXPORT_TEST_EVENT,
}
