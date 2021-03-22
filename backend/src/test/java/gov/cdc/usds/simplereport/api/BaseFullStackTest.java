package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
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
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.HttpStatus;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public abstract class BaseFullStackTest {

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
    ApiAuditEvent event = getTimeCheckedEvent();
    assertEquals(username, event.getUser().getLoginEmail());
    assertEquals(operationName, event.getGraphqlQueryDetails().getOperationName());
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

  protected ApiAuditEvent assertLastAuditEntry(HttpStatus status, String requestUri) {
    ApiAuditEvent event = getTimeCheckedEvent();
    HttpRequestDetails requestDetails = event.getHttpRequestDetails();
    if (requestUri != null) {
      assertEquals(requestUri, requestDetails.getRequestUri());
    }
    assertEquals(status.value(), event.getResponseCode(), "HTTP status code");
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
}
