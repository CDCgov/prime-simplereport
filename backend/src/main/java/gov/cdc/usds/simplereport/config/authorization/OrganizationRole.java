package gov.cdc.usds.simplereport.config.authorization;

import java.security.Principal;
import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

/** The roles that can be granted (via Okta) to a user. */
public enum OrganizationRole implements Principal {
  /**
   * This is the base role that we expect every user to have. Any other role that has more specific
   * permissions takes precedence over this role. NOTE: this role does not give you any meaningful
   * permissions, and thus must be accompanied by other roles for a user to be able to use the app.
   */
  NO_ACCESS("No-access member", EnumSet.noneOf(UserPermission.class)),
  /**
   * This is the role that gives you access to all facilities in your organization; admins also have
   * all-facility access by default. NOTE: this role does not give you any meaningful permissions
   * besides the ability to exercise other permissioned features on all facilities, and thus must be
   * accompanied by other roles for a user to be able to use the app.
   */
  ALL_FACILITIES("All-facility-access user", EnumSet.of(UserPermission.ACCESS_ALL_FACILITIES)),
  /**
   * This is the role for users who are only permitted to create and submit tests, but cannot view
   * historical data or read the entire patient roster.
   */
  ENTRY_ONLY(
      "Test-entry user",
      EnumSet.of(
          UserPermission.SEARCH_PATIENTS,
          UserPermission.START_TEST,
          UserPermission.UPDATE_TEST,
          UserPermission.SUBMIT_TEST)),
  /**
   * This is the standard role for users who can view and edit patients, create and submit tests,
   * and view historical test results.
   */
  USER(
      "Standard user",
      EnumSet.of(
          UserPermission.READ_PATIENT_LIST,
          UserPermission.SEARCH_PATIENTS,
          UserPermission.READ_RESULT_LIST,
          UserPermission.EDIT_PATIENT,
          UserPermission.ARCHIVE_PATIENT,
          UserPermission.START_TEST,
          UserPermission.UPDATE_TEST,
          UserPermission.SUBMIT_TEST,
          UserPermission.UPLOAD_RESULTS_SPREADSHEET)),

  /**
   * This is the organization admin role: if you have this role, then you have the ability to change
   * your role, so other roles you may have are moot. This role's permissions take precedence over
   * any other roles.
   */
  ADMIN(
      "Admin user",
      EnumSet.of(
          UserPermission.READ_PATIENT_LIST,
          UserPermission.READ_ARCHIVED_PATIENT_LIST,
          UserPermission.SEARCH_PATIENTS,
          UserPermission.READ_RESULT_LIST,
          UserPermission.EDIT_PATIENT,
          UserPermission.ARCHIVE_PATIENT,
          UserPermission.EDIT_FACILITY,
          UserPermission.EDIT_ORGANIZATION,
          UserPermission.MANAGE_USERS,
          UserPermission.START_TEST,
          UserPermission.UPDATE_TEST,
          UserPermission.SUBMIT_TEST,
          UserPermission.ACCESS_ALL_FACILITIES,
          UserPermission.VIEW_ARCHIVED_FACILITIES,
          UserPermission.UPLOAD_RESULTS_SPREADSHEET));

  private String description;
  private Set<UserPermission> grantedPermissions;

  private OrganizationRole(String description, Set<UserPermission> permissions) {
    this.description = description;
    this.grantedPermissions = Collections.unmodifiableSet(EnumSet.copyOf(permissions));
  }

  public String getDescription() {
    return description;
  }

  public Set<UserPermission> getGrantedPermissions() {
    return this.grantedPermissions;
  }

  @Override
  public String getName() {
    return name();
  }

  public static final OrganizationRole getDefault() {
    return NO_ACCESS;
  }
}
