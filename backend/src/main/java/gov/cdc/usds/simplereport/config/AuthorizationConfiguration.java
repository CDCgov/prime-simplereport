package gov.cdc.usds.simplereport.config;

import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

/**
 * Configuration (mostly static) for method-level or object-level security in the application (as
 * opposed to request-level security, which lives in {@link SecurityConfiguration}).
 */
@Configuration
@EnableMethodSecurity
public class AuthorizationConfiguration {

  /**
   * The name of the bean that is to be used in SPeL access-control annotations. Should be attached
   * to a bean by way of the Bean or Component annotation; exactly one such bean must be present in
   * the application context.
   */
  public static final String AUTHORIZER_BEAN = "simpleReportAuthVerifier";

  private static final String SPEL_IS_VALID = "@" + AUTHORIZER_BEAN + ".userIsValid()";

  private static final String SPEL_HAS_PERMISSION =
      "@"
          + AUTHORIZER_BEAN
          + ".userHasPermission("
          + "T(gov.cdc.usds.simplereport.config.authorization.UserPermission).";

  private static final String SPEL_HAS_PERMISSION_READ_PATIENT_LIST =
      SPEL_HAS_PERMISSION + "READ_PATIENT_LIST" + ")";

  private static final String SPEL_HAS_PERMISSION_READ_ARCHIVED_PATIENT_LIST =
      SPEL_HAS_PERMISSION + "READ_ARCHIVED_PATIENT_LIST" + ")";

  private static final String SPEL_HAS_PERMISSION_SEARCH_PATIENTS =
      SPEL_HAS_PERMISSION + "SEARCH_PATIENTS" + ")";

  private static final String SPEL_HAS_PERMISSION_READ_RESULT_LIST =
      SPEL_HAS_PERMISSION + "READ_RESULT_LIST" + ")";

  private static final String SPEL_HAS_PERMISSION_EDIT_PATIENT =
      SPEL_HAS_PERMISSION + "EDIT_PATIENT" + ")";

  private static final String SPEL_HAS_PERMISSION_ARCHIVE_PATIENT =
      SPEL_HAS_PERMISSION + "ARCHIVE_PATIENT" + ")";

  private static final String SPEL_HAS_PERMISSION_EDIT_FACILITY =
      SPEL_HAS_PERMISSION + "EDIT_FACILITY" + ")";

  private static final String SPEL_HAS_PERMISSION_EDIT_ORGANIZATION =
      SPEL_HAS_PERMISSION + "EDIT_ORGANIZATION" + ")";

  private static final String SPEL_HAS_PERMISSION_MANAGE_USERS =
      SPEL_HAS_PERMISSION + "MANAGE_USERS" + ")";

  private static final String SPEL_HAS_PERMISSION_START_TEST =
      SPEL_HAS_PERMISSION + "START_TEST" + ")";

  private static final String SPEL_HAS_PERMISSION_UPDATE_TEST =
      SPEL_HAS_PERMISSION + "UPDATE_TEST" + ")";

  private static final String SPEL_HAS_PERMISSION_SUBMIT_TEST =
      SPEL_HAS_PERMISSION + "SUBMIT_TEST" + ")";

  private static final String SPEL_HAS_PERMISSION_VIEW_ARCHIVED_FACILITIES =
      SPEL_HAS_PERMISSION + "VIEW_ARCHIVED_FACILITIES" + ")";

  private static final String SPEL_HAS_PERMISSION_ACCESS_ALL_FACILITIES =
      SPEL_HAS_PERMISSION + "ACCESS_ALL_FACILITIES" + ")";

  private static final String SPEL_HAS_PERMISSION_RESULTS_UPLOAD =
      SPEL_HAS_PERMISSION + "UPLOAD_RESULTS_SPREADSHEET" + ")";

  private static final String SPEL_IS_SITE_ADMIN =
      "@" + AUTHORIZER_BEAN + ".userHasSiteAdminRole()";

  private static final String SPEL_IS_NOT_SELF = "@" + AUTHORIZER_BEAN + ".userIsNotSelf(#userId)";

  private static final String SPEL_IS_IN_SAME_ORG =
      "@" + AUTHORIZER_BEAN + ".userIsInSameOrg(#userId)";

  private static final String SPEL_CAN_MANAGE_USER =
      "(" + SPEL_HAS_PERMISSION_MANAGE_USERS + " && " + SPEL_IS_IN_SAME_ORG + ")";

  private static final String SPEL_CAN_ACCESS_FACILITY =
      "@" + AUTHORIZER_BEAN + ".userCanAccessFacility(#facilityId)";

  private static final String SPEL_CAN_ACCESS_PROVIDER =
      "@" + AUTHORIZER_BEAN + ".userCanAccessProvider(#providerInternalId)";

  private static final String SPEL_CAN_VIEW_PATIENT =
      "@" + AUTHORIZER_BEAN + ".userCanViewPatient(#patient)";

  private static final String SPEL_CAN_VIEW_PATIENT_BY_ID =
      "@" + AUTHORIZER_BEAN + ".userCanViewPatient(#patientId)";

  private static final String SPEL_CAN_VIEW_TEST_EVENT =
      "@" + AUTHORIZER_BEAN + ".userCanViewTestEvent(#testEventId)";

  private static final String SPEL_CAN_VIEW_QUEUE_ITEM =
      "@" + AUTHORIZER_BEAN + ".userCanViewQueueItem(#testOrderId)";

  private static final String SPEL_CAN_VIEW_QUEUE_ITEM_FOR_PATIENT =
      "@" + AUTHORIZER_BEAN + ".userCanViewQueueItemForPatient(#patientId)";

  private static final String SPEL_CAN_ACCESS_PATIENT_LINK =
      "@" + AUTHORIZER_BEAN + ".userCanAccessPatientLink(#patientLinkId)";

  private static final String SPEL_CAN_EXECUTE_SPECIFIC_PATIENT_SEARCH =
      "@"
          + AUTHORIZER_BEAN
          + ".userHasSpecificPatientSearchPermission(#facilityId, #archivedStatus, #namePrefixMatch, #includeArchivedFacilities, #orgExternalId)";
  private static final String SPEL_SITE_ADMIN_CAN_ARCHIVE_PATIENT =
      "@" + AUTHORIZER_BEAN + ".siteAdminCanArchivePatient(#orgExternalId)";

  private static final String SPEL_CAN_ACCESS_ORG =
      "@" + AUTHORIZER_BEAN + ".userHasPermissionToAccessOrg(#orgId)";

  /**
   * Apply this annotation if the method should only be called by site-wide administrative users
   * ("superusers").
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(SPEL_IS_VALID + " && " + SPEL_IS_SITE_ADMIN)
  public @interface RequireGlobalAdminUser {}

  /**
   * Require the current user to to be one of the administrative users ("superusers") or have the
   * {@link UserPermission#MANAGE_USERS} permission for the organization containing user with UUID
   * {@code userId}. NOTE: any method with this annotation must have a parameter {@code userId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID + " && " + "(" + SPEL_IS_SITE_ADMIN + " || " + SPEL_CAN_MANAGE_USER + ")")
  public @interface RequirePermissionManageTargetUser {}

  /**
   * Require the current user to to be one of the administrative users ("superusers") or have the
   * {@link UserPermission#MANAGE_USERS} permission for the organization containing user with UUID
   * {@code userId}; and require the user to not be the user they are operating on.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code userId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID
          + " && "
          + SPEL_IS_NOT_SELF
          + " && "
          + "("
          + SPEL_IS_SITE_ADMIN
          + " || "
          + SPEL_CAN_MANAGE_USER
          + ")")
  public @interface RequirePermissionManageTargetUserNotSelf {}

  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(SPEL_IS_VALID + " && " + SPEL_CAN_ACCESS_ORG)
  public @interface RequirePermissionToAccessOrg {}

  /**
   * Require the current user to have the {@link UserPermission#READ_ARCHIVED_PATIENT_LIST}
   * permission.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(SPEL_IS_VALID + " && " + SPEL_HAS_PERMISSION_READ_ARCHIVED_PATIENT_LIST)
  public @interface RequirePermissionReadArchivedPatientList {}

  /**
   * Require the current user to have the {@link UserPermission#READ_RESULT_LIST} permission for the
   * test event with UUID {@code testEventId}.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code testEventId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID
          + " && "
          + SPEL_HAS_PERMISSION_READ_RESULT_LIST
          + " && "
          + SPEL_CAN_VIEW_TEST_EVENT)
  public @interface RequirePermissionReadResultListForTestEvent {}

  /**
   * Require the current user to have the {@link UserPermission#READ_RESULT_LIST} permission at the
   * facility with UUID {@code facilityId}.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code facilityId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID
          + " && "
          + SPEL_HAS_PERMISSION_READ_RESULT_LIST
          + " && "
          + SPEL_CAN_ACCESS_FACILITY)
  public @interface RequirePermissionReadResultListAtFacility {}

  /**
   * Require the current user to have the {@link UserPermission#READ_RESULT_LIST} permission for the
   * patient {@code patient}.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code patient}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID
          + " && "
          + SPEL_HAS_PERMISSION_READ_RESULT_LIST
          + " && "
          + SPEL_CAN_VIEW_PATIENT)
  public @interface RequirePermissionReadResultListForPatient {}

  /**
   * Require the current user to have the {@link UserPermission#EDIT_PATIENT} permission at the
   * facility with UUID {@code facilityId}.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code facilityId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID + " && " + SPEL_HAS_PERMISSION_EDIT_PATIENT + " && " + SPEL_CAN_ACCESS_FACILITY)
  public @interface RequirePermissionCreatePatientAtFacility {}

  /**
   * Require the current user to have the {@link UserPermission#EDIT_PATIENT} permission for
   *
   * <p>- the facility with UUID {@code facilityId}; AND
   *
   * <p>- the patient with UUID {@code patientId}.
   *
   * <p>NOTE: any method with this annotation must have the parameters {@code facilityId} and {@code
   * patientId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID
          + " && "
          + SPEL_HAS_PERMISSION_EDIT_PATIENT
          + " && "
          + SPEL_CAN_ACCESS_FACILITY
          + " && "
          + SPEL_CAN_VIEW_PATIENT_BY_ID)
  public @interface RequirePermissionEditPatientAtFacility {}

  /**
   * Require the current user to have the {@link UserPermission#ARCHIVE_PATIENT} permission for the
   * patient with UUID {@code patientId} or is a site admin with a valid orgExternalId
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code patientId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID
          + " && "
          + "("
          + SPEL_SITE_ADMIN_CAN_ARCHIVE_PATIENT
          + " || "
          + SPEL_HAS_PERMISSION_ARCHIVE_PATIENT
          + " && "
          + SPEL_CAN_VIEW_PATIENT_BY_ID
          + ")")
  public @interface RequirePermissionArchiveTargetPatient {}

  /** Require the current user to have the {@link UserPermission#EDIT_FACILITY} permission. */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(SPEL_IS_VALID + " && " + SPEL_HAS_PERMISSION_EDIT_FACILITY)
  public @interface RequirePermissionEditFacility {}

  /**
   * Require the current user to have the {@link UserPermission#EDIT_FACILITY} permission and have
   * access to the provider with UUID {@code providerInternalId}.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code providerInternalId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID
          + " && "
          + SPEL_HAS_PERMISSION_EDIT_FACILITY
          + " && "
          + SPEL_CAN_ACCESS_PROVIDER)
  public @interface RequirePermissionEditProvider {}

  /** Require the current user to have the {@link UserPermission#EDIT_ORGANIZATION} permission. */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(SPEL_IS_VALID + " && " + SPEL_HAS_PERMISSION_EDIT_ORGANIZATION)
  public @interface RequirePermissionEditOrganization {}

  /** Require the current user to have the {@link UserPermission#MANAGE_USERS} permission. */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(SPEL_IS_VALID + " && " + SPEL_HAS_PERMISSION_MANAGE_USERS)
  public @interface RequirePermissionManageUsers {}

  /**
   * Require the current user to have the {@link UserPermission#VIEW_ARCHIVED_FACILITIES} permission
   * and the {@link UserPermission#ACCESS_ALL_FACILITIES} permission.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID
          + " && "
          + SPEL_HAS_PERMISSION_VIEW_ARCHIVED_FACILITIES
          + " && "
          + SPEL_HAS_PERMISSION_ACCESS_ALL_FACILITIES)
  public @interface RequirePermissionViewAllFacilityResults {}

  /**
   * Require the current user to have the {@link UserPermission#VIEW_ARCHIVED_FACILITIES}
   * permission.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(SPEL_IS_VALID + " && " + SPEL_HAS_PERMISSION_VIEW_ARCHIVED_FACILITIES)
  public @interface RequirePermissionViewArchivedFacilities {}

  /**
   * Require the current user to have the {@link UserPermission#SEARCH_PATIENTS} permission for the
   * patient with UUID {@code patientId}.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code patientId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID
          + " && "
          + SPEL_HAS_PERMISSION_SEARCH_PATIENTS
          + " && "
          + SPEL_CAN_VIEW_PATIENT_BY_ID)
  public @interface RequirePermissionSearchTargetPatient {}

  /**
   * Require the current user to have the permission to search for patients:
   *
   * <p>- in the facility with UUID {@code facilityId};
   *
   * <p>- whose archived status is {@code isArchived};
   *
   * <p>- whose name elements begin with {@code namePrefixMatch}; AND
   *
   * <p>- who are in archived facilities (if {@code includeArchivedFacilities = true})
   *
   * <p>NOTE: any method with this annotation must have the parameters {@code facilityId}, {@code
   * isArchived} and {@code namePrefixMatch}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(SPEL_IS_VALID + " && " + SPEL_CAN_EXECUTE_SPECIFIC_PATIENT_SEARCH)
  public @interface RequireSpecificPatientSearchPermission {}

  /**
   * Require the current user to have the {@link UserPermission#START_TEST} permission at the
   * facility with UUID {@code facilityId}.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code facilityId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID + " && " + SPEL_HAS_PERMISSION_START_TEST + " && " + SPEL_CAN_ACCESS_FACILITY)
  public @interface RequirePermissionStartTestAtFacility {}

  /**
   * Require the current user to have the {@link UserPermission#START_TEST} permission for the
   * patient {@code patient}.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code patient}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID + " && " + SPEL_HAS_PERMISSION_START_TEST + " && " + SPEL_CAN_VIEW_PATIENT)
  public @interface RequirePermissionStartTestForPatient {}

  /**
   * Require the current user to have the {@link UserPermission#START_TEST} permission for the
   * patient with UUID {@code patientId}.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code patientId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID
          + " && "
          + SPEL_HAS_PERMISSION_START_TEST
          + " && "
          + SPEL_CAN_VIEW_PATIENT_BY_ID)
  public @interface RequirePermissionStartTestForPatientById {}

  /**
   * Require the current user to have the {@link UserPermission#START_TEST} permission with access
   * to the patient link with UUID {@code patientLinkId}.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code patientLinkId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID
          + " && "
          + SPEL_HAS_PERMISSION_START_TEST
          + " && "
          + SPEL_CAN_ACCESS_PATIENT_LINK)
  public @interface RequirePermissionStartTestWithPatientLink {}

  /**
   * Require the current user to have the {@link UserPermission#UPDATE_TEST} permission for the
   * queue item for patient with UUID {@code patientId}.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code patientId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID
          + " && "
          + SPEL_HAS_PERMISSION_UPDATE_TEST
          + " && "
          + SPEL_CAN_VIEW_QUEUE_ITEM_FOR_PATIENT)
  public @interface RequirePermissionUpdateTestForPatient {}

  /**
   * Require the current user to have the {@link UserPermission#UPDATE_TEST} permission for the test
   * event with UUID {@code testEventId}.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code testEventId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID + " && " + SPEL_HAS_PERMISSION_UPDATE_TEST + " && " + SPEL_CAN_VIEW_TEST_EVENT)
  public @interface RequirePermissionUpdateTestForTestEvent {}

  /**
   * Require the current user to have the {@link UserPermission#UPDATE_TEST} permission for the
   * queue item with UUID {@code testOrderId}.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code testOrderId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID + " && " + SPEL_HAS_PERMISSION_UPDATE_TEST + " && " + SPEL_CAN_VIEW_QUEUE_ITEM)
  public @interface RequirePermissionUpdateTestForTestOrder {}

  /**
   * Require the current user to have the {@link UserPermission#SUBMIT_TEST} permission for the
   * queue item for patient with UUID {@code patientId}.
   *
   * <p>NOTE: any method with this annotation must have a parameter {@code patientId}.
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(
      SPEL_IS_VALID
          + " && "
          + SPEL_HAS_PERMISSION_SUBMIT_TEST
          + " && "
          + SPEL_CAN_VIEW_QUEUE_ITEM_FOR_PATIENT)
  public @interface RequirePermissionSubmitTestForPatient {}

  /**
   * Require the current user to have the {@link UserPermission#UPLOAD_RESULTS_SPREADSHEET}
   * permission
   */
  @Retention(RUNTIME)
  @Target(METHOD)
  @PreAuthorize(SPEL_IS_VALID + " && " + SPEL_HAS_PERMISSION_RESULTS_UPLOAD)
  public @interface RequirePermissionCSVUpload {}
}
