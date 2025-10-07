package gov.cdc.usds.simplereport.api.graphql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import gov.cdc.usds.simplereport.api.ResourceLinks;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ConsoleApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.apache.commons.lang3.mutable.MutableObject;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class AuditLoggingTest extends BaseGraphqlTest {

  @Autowired private MockMvc _mockMvc;

  private static final Set<UserPermission> STANDARD_PERMS_TODAY =
      Set.of(
          UserPermission.READ_PATIENT_LIST,
          UserPermission.SEARCH_PATIENTS,
          UserPermission.READ_RESULT_LIST,
          UserPermission.EDIT_PATIENT,
          UserPermission.ARCHIVE_PATIENT,
          UserPermission.START_TEST,
          UserPermission.UPDATE_TEST,
          UserPermission.SUBMIT_TEST,
          UserPermission.UPLOAD_RESULTS_SPREADSHEET);

  @Test
  void auditableGraphqlRequest_noInterestingHeaders_boringAudit() {
    useOrgUser();
    runQuery("current-user-query", "whoDat", null, null);
    ConsoleApiAuditEvent event =
        assertLastAuditEntry(
            null, TestUserIdentities.STANDARD_USER, "whoDat", STANDARD_PERMS_TODAY, null);
    assertEquals(TestUserIdentities.DEFAULT_ORGANIZATION, event.getOrganization().getExternalId());

    HttpRequestDetails httpDetails = event.getHttpRequestDetails();
    // defaults
    assertNotNull(event.getRequestId());
    assertEquals("localhost", httpDetails.getServerName());
    assertEquals("/graphql", httpDetails.getRequestUri());
    assertEquals("127.0.0.1", httpDetails.getRemoteAddress());
    // not supplied
    assertEquals(List.of(), httpDetails.getForwardedAddresses());
    assertNull(httpDetails.getForwardedProtocol());
    assertNull(httpDetails.getOriginalHostName());
  }

  @Test
  void auditableGraphqlRequest_interestingHeaders_auditCorrect() {
    useOrgUser();
    addHeader("X-FORWARDED-FOR", "10.10.3.2:1"); // old joke
    addHeader("X-forwarded-Proto", "ssh");
    addHeader("x-ORIGINAL-host", "simplereport.ly");
    runQuery("current-user-query", "whoDat", null, null);
    ConsoleApiAuditEvent event =
        assertLastAuditEntry(
            null, TestUserIdentities.STANDARD_USER, "whoDat", STANDARD_PERMS_TODAY, null);
    assertEquals(TestUserIdentities.DEFAULT_ORGANIZATION, event.getOrganization().getExternalId());
    assertNotNull(event.getRequestId());

    HttpRequestDetails httpDetails = event.getHttpRequestDetails();
    assertEquals(List.of("10.10.3.2:1"), httpDetails.getForwardedAddresses());
    assertEquals("ssh", httpDetails.getForwardedProtocol());
    assertEquals("simplereport.ly", httpDetails.getOriginalHostName());
  }

  @Test
  void auditableGraphqlRequest_nonStandardOrgUser_correctUserAndOrg() {
    useOutsideOrgAdmin();
    runQuery("current-user-query", "whoDat", null, null);
    ConsoleApiAuditEvent event =
        assertLastAuditEntry(
            null,
            TestUserIdentities.OTHER_ORG_ADMIN,
            "whoDat",
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
                UserPermission.UPLOAD_RESULTS_SPREADSHEET),
            null);

    assertNotNull(event.getRequestId());
    assertEquals(
        "DAT_ORG", // this should be a constant
        event.getOrganization().getExternalId());
  }

  @Test
  void auditableRestRequest_noHeaders_boringAudit() throws Exception {
    PatientLink link = createLink();
    String requestBody =
        JsonNodeFactory.instance
            .objectNode()
            .put("patientLinkId", link.getInternalId().toString())
            .put("dateOfBirth", TestDataFactory.DEFAULT_BDAY.toString())
            .toString();
    _mockMvc
        .perform(withJsonContent(post(ResourceLinks.VERIFY_LINK_V2), requestBody))
        .andExpect(status().isOk());

    ConsoleApiAuditEvent event =
        assertLastAuditEntry(HttpStatus.OK, ResourceLinks.VERIFY_LINK_V2, null);
    assertEquals(link.getInternalId(), event.getPatientLink().getInternalId(), "patient link");
    assertEquals(TestDataFactory.DEFAULT_ORG_ID, event.getOrganization().getExternalId());

    HttpRequestDetails httpDetails = event.getHttpRequestDetails(); // we already checked requestUri
    // defaults
    assertEquals("localhost", httpDetails.getServerName());
    assertEquals("127.0.0.1", httpDetails.getRemoteAddress());
    // not supplied
    assertEquals(List.of(), httpDetails.getForwardedAddresses());
    assertNull(httpDetails.getForwardedProtocol());
    assertNull(httpDetails.getOriginalHostName());
  }

  private PatientLink createLink() {
    MutableObject<PatientLink> linkHolder = new MutableObject<>();
    TestUserIdentities.withStandardUser(
        () -> {
          Organization org = _dataFactory.saveValidOrganization();
          Facility site = _dataFactory.createValidFacility(org);
          Person person = _dataFactory.createFullPerson(org);
          TestEvent testEvent = _dataFactory.createTestEvent(person, site);
          linkHolder.setValue(_dataFactory.createPatientLink(testEvent.getTestOrder()));
        });
    return linkHolder.getValue();
  }

  @Test
  void auditableRestRequest_funnyHeaders_auditCorrect() throws Exception {
    PatientLink link = createLink();
    String requestBody =
        JsonNodeFactory.instance
            .objectNode()
            .put("patientLinkId", link.getInternalId().toString())
            .put("dateOfBirth", TestDataFactory.DEFAULT_BDAY.toString())
            .toString();
    MockHttpServletRequestBuilder req =
        withJsonContent(post(ResourceLinks.VERIFY_LINK_V2), requestBody)
            .header("X-forwarded-PROTO", "gopher")
            .header("x-ORIGINAL-HOST", "simplereport.simple")
            .header("x-forwarded-for", "192.168.153.128:80, 10.3.1.1:443");
    _mockMvc.perform(req).andExpect(status().isOk());

    ConsoleApiAuditEvent event =
        assertLastAuditEntry(HttpStatus.OK, ResourceLinks.VERIFY_LINK_V2, null);
    assertEquals(link.getInternalId(), event.getPatientLink().getInternalId(), "patient link");
    assertEquals(TestDataFactory.DEFAULT_ORG_ID, event.getOrganization().getExternalId());

    HttpRequestDetails httpDetails = event.getHttpRequestDetails(); // we already checked requestUri
    // defaults
    assertEquals("localhost", httpDetails.getServerName());
    assertEquals("127.0.0.1", httpDetails.getRemoteAddress());

    assertEquals(
        List.of("192.168.153.128:80", "10.3.1.1:443"), httpDetails.getForwardedAddresses());
    assertEquals("gopher", httpDetails.getForwardedProtocol());
    assertEquals("simplereport.simple", httpDetails.getOriginalHostName());
  }

  // Temporarily disabled while audit logging on AccountRequestController is resolved.
  /*
  @Test
  void anonymousRestRequest_auditCorrect() throws Exception {
    String requestBody =
        JsonNodeFactory.instance
            .objectNode()
            .put("name", "Angela Chan")
            .put("email", "qasas@mailinator.com")
            .put("phone", "+1 (157) 294-1842")
            .put("state", "Exercitation odit pr")
            .put("organization", "Lane Moss LLC")
            .put("referral", "Ea error voluptate v")
            .toString();
    MockHttpServletRequestBuilder req =
        withJsonContent(post(ResourceLinks.WAITLIST_REQUEST), requestBody)
            .header("X-forwarded-PROTO", "gopher")
            .header("x-ORIGINAL-HOST", "simplereport.simple")
            .header("x-forwarded-for", "192.168.153.128:80, 10.3.1.1:443");
    _mockMvc.perform(req).andExpect(status().isOk());
    assertLastAuditEntry(HttpStatus.OK, ResourceLinks.WAITLIST_REQUEST, null);
  }
  */
}
