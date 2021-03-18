package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.util.Date;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AuditLoggingTest extends BaseApiTest {

  private static final Set<UserPermission> STANDARD_PERMS_TODAY =
      Set.of(
          UserPermission.READ_PATIENT_LIST,
          UserPermission.SEARCH_PATIENTS,
          UserPermission.READ_RESULT_LIST,
          UserPermission.EDIT_PATIENT,
          UserPermission.ARCHIVE_PATIENT,
          UserPermission.START_TEST,
          UserPermission.UPDATE_TEST,
          UserPermission.SUBMIT_TEST);
  private Date _start;

  @BeforeEach
  void setNow() {
    _start = new Date();
  }

  @Test
  void auditableRequest_noInterestingHeaders_boringAudit() {
    useOrgUser();
    runQuery("current-user-query");
    ApiAuditEvent event =
        assertLastAuditEntry(
            TestUserIdentities.STANDARD_USER,
            "current-user-query-operation",
            STANDARD_PERMS_TODAY,
            null);
    assertTimestampSanity(event);
    assertEquals(TestUserIdentities.DEFAULT_ORGANIZATION, event.getOrganization().getExternalId());

    HttpRequestDetails httpDetails = event.getHttpRequestDetails();
    // defaults
    assertEquals("localhost", httpDetails.getServerName());
    assertEquals("/graphql", httpDetails.getRequestUri());
    assertEquals("127.0.0.1", httpDetails.getRemoteAddress());
    // not supplied
    assertEquals(List.of(), httpDetails.getForwardedAddresses());
    assertNull(httpDetails.getForwardedProtocol());
    assertNull(httpDetails.getOriginalHostName());
  }

  @Test
  void auditableRequest_interestingHeaders_auditCorrect() {
    useOrgUser();
    addHeader("X-FORWARDED-FOR", "10.10.3.2:1"); // old joke
    addHeader("X-forwarded-Proto", "ssh");
    addHeader("x-ORIGINAL-host", "simplereport.ly");
    runQuery("current-user-query");
    ApiAuditEvent event =
        assertLastAuditEntry(
            TestUserIdentities.STANDARD_USER,
            "current-user-query-operation",
            STANDARD_PERMS_TODAY,
            null);
    assertTimestampSanity(event);
    assertEquals(TestUserIdentities.DEFAULT_ORGANIZATION, event.getOrganization().getExternalId());

    HttpRequestDetails httpDetails = event.getHttpRequestDetails();
    assertEquals(List.of("10.10.3.2:1"), httpDetails.getForwardedAddresses());
    assertEquals("ssh", httpDetails.getForwardedProtocol());
    assertEquals("simplereport.ly", httpDetails.getOriginalHostName());
  }

  @Test
  void auditableRequest_nonStandardOrgUser_correctUserAndOrg() {
    useOutsideOrgAdmin();
    runQuery("current-user-query");
    ApiAuditEvent event =
        assertLastAuditEntry(
            TestUserIdentities.OTHER_ORG_ADMIN,
            "current-user-query-operation",
            EnumSet.allOf(UserPermission.class),
            null);
    assertTimestampSanity(event);
    assertEquals(
        "DAT_ORG", // this should be a constant
        event.getOrganization().getExternalId());
  }

  private void assertTimestampSanity(ApiAuditEvent event) {
    Date eventTimestamp = event.getEventTimestamp();
    Date postQuery = new Date();
    assertTrue(
        _start.before(eventTimestamp) || _start.equals(eventTimestamp),
        "event timestamp after test start");
    assertTrue(
        postQuery.after(eventTimestamp) || postQuery.equals(eventTimestamp),
        "event timestamp before now");
  }
}
