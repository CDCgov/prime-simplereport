package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ConsoleApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.logging.LoggingConstants;
import gov.cdc.usds.simplereport.service.AuditLoggerService;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/**
 * Base class for all tests that simulate fully-integrated API requests by either patients or
 * providers.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class BaseFullStackTest {

  @Autowired private DbTruncator _truncator;
  @Autowired protected TestDataFactory _dataFactory;
  @MockitoSpyBean protected OrganizationService _orgService;
  @Autowired protected DemoOktaRepository _oktaRepo;
  @MockitoSpyBean AuditLoggerService auditLoggerServiceSpy;
  @Captor private ArgumentCaptor<ConsoleApiAuditEvent> auditLogCaptor;
  @Autowired protected DiseaseService _diseaseService;
  @Autowired private SupportedDiseaseRepository _diseaseRepo;

  @BeforeEach
  void initTestStart() {
    reset(auditLoggerServiceSpy);
    _diseaseService.initDiseases();
  }

  protected void truncateDb() {
    _truncator.truncateAll();
  }

  protected ConsoleApiAuditEvent assertLastAuditEntry(
      String username,
      String operationName,
      Set<UserPermission> permissions,
      List<String> errorPaths) {
    return assertLastAuditEntry(null, username, operationName, permissions, errorPaths);
  }

  protected ConsoleApiAuditEvent assertLastAuditEntry(
      String requestId,
      String username,
      String operationName,
      Set<UserPermission> permissions,
      List<String> errorPaths) {
    ConsoleApiAuditEvent event = getTimeCheckedEvent();
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
  protected ConsoleApiAuditEvent assertLastAuditEntry(
      HttpStatus status, String requestUri, String requestId) {
    ConsoleApiAuditEvent event = getTimeCheckedEvent();
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

  protected ConsoleApiAuditEvent assertLastAuditEntry(
      String username, String organizationExternalId, Set<UserPermission> permissions) {
    ConsoleApiAuditEvent event = getTimeCheckedEvent();
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
    verifyNoInteractions(auditLoggerServiceSpy);
  }

  private ConsoleApiAuditEvent getTimeCheckedEvent() {
    verify(auditLoggerServiceSpy, atLeastOnce()).logEvent(auditLogCaptor.capture());
    ConsoleApiAuditEvent event = auditLogCaptor.getValue();
    assertNotNull(event);
    return event;
  }

  protected MockHttpServletRequestBuilder withJsonContent(
      MockHttpServletRequestBuilder builder, String jsonContent) {
    return builder
        .contentType(MediaType.APPLICATION_JSON_VALUE)
        .accept(MediaType.APPLICATION_JSON)
        .characterEncoding("UTF-8")
        .content(jsonContent);
  }

  public static String runBuilderReturningRequestId(
      MockMvc mockMvc, RequestBuilder builder, ResultMatcher statusMatcher) throws Exception {
    return mockMvc
        .perform(builder)
        .andExpect(statusMatcher)
        .andReturn()
        .getResponse()
        .getHeader(LoggingConstants.REQUEST_ID_HEADER);
  }
}
