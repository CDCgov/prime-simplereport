package gov.cdc.usds.simplereport.api.graphql;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import gov.cdc.usds.simplereport.api.ResourceLinks;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

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
          UserPermission.SUBMIT_TEST);

  @Test
  void auditableGraphqlRequest_noInterestingHeaders_boringAudit() {
    useOrgUser();
    runQuery("current-user-query");
    String requestId = getGraphqlRequestIdHeader();
    ApiAuditEvent event =
        assertLastAuditEntry(
            requestId, TestUserIdentities.STANDARD_USER, "whoDat", STANDARD_PERMS_TODAY, null);
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
  void auditableGraphqlRequest_interestingHeaders_auditCorrect() {
    useOrgUser();
    addHeader("X-FORWARDED-FOR", "10.10.3.2:1"); // old joke
    addHeader("X-forwarded-Proto", "ssh");
    addHeader("x-ORIGINAL-host", "simplereport.ly");
    runQuery("current-user-query");
    String requestId = getGraphqlRequestIdHeader();
    ApiAuditEvent event =
        assertLastAuditEntry(
            requestId, TestUserIdentities.STANDARD_USER, "whoDat", STANDARD_PERMS_TODAY, null);
    assertTimestampSanity(event);
    assertEquals(TestUserIdentities.DEFAULT_ORGANIZATION, event.getOrganization().getExternalId());

    HttpRequestDetails httpDetails = event.getHttpRequestDetails();
    assertEquals(List.of("10.10.3.2:1"), httpDetails.getForwardedAddresses());
    assertEquals("ssh", httpDetails.getForwardedProtocol());
    assertEquals("simplereport.ly", httpDetails.getOriginalHostName());
  }

  @Test
  void auditableGraphqlRequest_nonStandardOrgUser_correctUserAndOrg() {
    useOutsideOrgAdmin();
    runQuery("current-user-query");
    ApiAuditEvent event =
        assertLastAuditEntry(
            getGraphqlRequestIdHeader(),
            TestUserIdentities.OTHER_ORG_ADMIN,
            "whoDat",
            EnumSet.allOf(UserPermission.class),
            null);
    assertTimestampSanity(event);
    assertEquals(
        "DAT_ORG", // this should be a constant
        event.getOrganization().getExternalId());
  }

  private String getGraphqlRequestIdHeader() {
    List<String> header = getLastResponse().getHeaders().get("X-Simplereport-RequestId");
    assertThat(header).isNotNull().hasSize(1);
    return header.get(0);
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
        .perform(withJsonContent(post(ResourceLinks.VERIFY_LINK), requestBody))
        .andExpect(status().isOk());

    ApiAuditEvent event = assertLastAuditEntry(HttpStatus.OK, ResourceLinks.VERIFY_LINK, null);
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
          Organization org = _dataFactory.createValidOrg();
          Facility site = _dataFactory.createValidFacility(org);
          Person person = _dataFactory.createFullPerson(org);
          TestOrder testOrder = _dataFactory.createTestOrder(person, site);
          linkHolder.setValue(_dataFactory.createPatientLink(testOrder));
        });
    return linkHolder.getValue();
  }

  @Test
  void auditableRestRequest_funnyHeaders_auditCorrect() throws Exception {
    System.out.println("in auditable rest request test");
    PatientLink link = createLink();
    String requestBody =
        JsonNodeFactory.instance
            .objectNode()
            .put("patientLinkId", link.getInternalId().toString())
            .put("dateOfBirth", TestDataFactory.DEFAULT_BDAY.toString())
            .toString();
    MockHttpServletRequestBuilder req =
        withJsonContent(post(ResourceLinks.VERIFY_LINK), requestBody)
            .header("X-forwarded-PROTO", "gopher")
            .header("x-ORIGINAL-HOST", "simplereport.simple")
            .header("x-forwarded-for", "192.168.153.128:80, 10.3.1.1:443");
    _mockMvc.perform(req).andExpect(status().isOk());
    ApiAuditEvent event = assertLastAuditEntry(HttpStatus.OK, ResourceLinks.VERIFY_LINK, null);
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

  @Test
  void nonAuditableRestRequest_noAudit() throws Exception {
    // String requestBody =
    //     "{\"name\":\"Angela Chan\",\"email\":\"qasas@mailinator.com\",\"phone\":\"+1 (157) 294-1842\","
    //         + "\"state\":\"Exercitation odit pr\",\"organization\":\"Lane Moss LLC\","
    //         + "\"referral\":\"Ea error voluptate v\"}";
    String requestBody = JsonNodeFactory.instance
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
    assertNoAuditEvent();
  }
}
