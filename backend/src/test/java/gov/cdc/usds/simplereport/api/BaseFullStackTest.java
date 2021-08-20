package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.service.AuditService;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/**
 * Base class for all tests that simulate fully-integrated API requests by either patients or
 * providers.
 */
@SpringBootTest(
    webEnvironment = WebEnvironment.RANDOM_PORT,
    properties = {"spring-hibernate-query-utils.n-plus-one-queries-detection.error-level=ERROR"})
@AutoConfigureMockMvc
public abstract class BaseFullStackTest {

  @Autowired private CurrentTenantDataAccessContextHolder _tenantDataAccessContextHolder;
  @Autowired private DbTruncator _truncator;
  @Autowired private AuditService _auditService;
  @Autowired protected TestDataFactory _dataFactory;

  protected Date _testStart;

  @BeforeEach
  void initTestStart() {
    _testStart = new Date();
  }

  protected void truncateDb() {
    _truncator.truncateAll();
  }

  protected ApiAuditEvent assertLastAuditEntry(
      String username,
      String operationName,
      Set<UserPermission> permissions,
      List<String> errorPaths) {
    return assertLastAuditEntry(null, username, operationName, permissions, errorPaths);
  }

  protected ApiAuditEvent assertLastAuditEntry(
      String requestId,
      String username,
      String operationName,
      Set<UserPermission> permissions,
      List<String> errorPaths) {
    ApiAuditEvent event = getTimeCheckedEvent();
    assertEquals(username, event.getUser().getLoginEmail());
    assertEquals(operationName, event.getGraphqlQueryDetails().getOperationName());
    if (requestId != null) {
      assertEquals(requestId, event.getRequestId());
    }
    if (permissions != null) {
      assertEquals(
          permissions.stream().map(UserPermission::name).collect(Collectors.toSet()),
          Set.copyOf(event.getUserPermissions()),
          "Recorded user permissions");
    }
    if (errorPaths == null) {
      errorPaths = List.of();
    }
    assertEquals(errorPaths, event.getGraphqlErrorPaths(), "Query paths with errors");
    return event;
  }

  /** REST audit event checker: includes "this is not graphql" checks" */
  protected ApiAuditEvent assertLastAuditEntry(
      HttpStatus status, String requestUri, String requestId) {
    ApiAuditEvent event = getTimeCheckedEvent();
    assertNull(event.getGraphqlQueryDetails());
    assertNull(event.getGraphqlErrorPaths());
    HttpRequestDetails requestDetails = event.getHttpRequestDetails();
    if (requestUri != null) {
      assertEquals(requestUri, requestDetails.getRequestUri());
    }
    assertEquals(status.value(), event.getResponseCode(), "HTTP status code");
    if (requestId != null) {
      assertEquals(requestId, event.getRequestId(), "SimpleReport request ID");
    }
    return event;
  }

  protected ApiAuditEvent assertLastAuditEntry(
      String username, String organizationExternalId, Set<UserPermission> permissions) {
    ApiAuditEvent event = getTimeCheckedEvent();
    assertEquals(username, event.getUser().getLoginEmail());
    if (organizationExternalId == null) {
      assertNull(event.getOrganization());
    } else {
      assertEquals(organizationExternalId, event.getOrganization().getExternalId());
    }
    if (permissions != null) {
      assertEquals(
          permissions.stream().map(UserPermission::name).collect(Collectors.toSet()),
          Set.copyOf(event.getUserPermissions()),
          "Recorded user permissions");
    }
    return event;
  }

  protected void assertNoAuditEvent() {
    assertEquals(List.of(), _auditService.getLastEvents(AuditService.MAX_EVENT_FETCH));
  }

  private ApiAuditEvent getTimeCheckedEvent() {
    List<ApiAuditEvent> lastEvents = _auditService.getLastEvents(1);
    assertEquals(1, lastEvents.size(), "should find exactly one event");
    ApiAuditEvent event = lastEvents.get(0);
    assertFalse(
        _testStart.after(event.getEventTimestamp()),
        "event must have been created during this test");
    return event;
  }

  protected void assertTimestampSanity(ApiAuditEvent event, Date beforeRequest) {
    Date eventTimestamp = event.getEventTimestamp();
    Date postQuery = new Date();
    assertTrue(
        beforeRequest.before(eventTimestamp) || beforeRequest.equals(eventTimestamp),
        "event timestamp after test start");
    assertTrue(
        postQuery.after(eventTimestamp) || postQuery.equals(eventTimestamp),
        "event timestamp before now");
  }

  protected void assertTimestampSanity(ApiAuditEvent event) {
    assertTimestampSanity(event, _testStart);
  }

  protected MockHttpServletRequestBuilder withJsonContent(
      MockHttpServletRequestBuilder builder, String jsonContent) {
    return builder
        .contentType(MediaType.APPLICATION_JSON_VALUE)
        .accept(MediaType.APPLICATION_JSON)
        .characterEncoding("UTF-8")
        .content(jsonContent);
  }
}
