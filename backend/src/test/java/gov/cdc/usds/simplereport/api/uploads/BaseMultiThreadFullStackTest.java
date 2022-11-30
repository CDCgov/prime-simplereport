package gov.cdc.usds.simplereport.api.uploads;

import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import org.junit.jupiter.api.BeforeAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.TestPropertySource;

/**
 * Base class for all tests that simulate full API requests with a dependency on @Async services.
 */
@TestPropertySource(
    properties = {"hibernate.query.interceptor.error-level=EXCEPTION"
      //      "spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"
    })
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public abstract class BaseMultiThreadFullStackTest {

  //    @Autowired private CurrentTenantDataAccessContextHolder _tenantDataAccessContextHolder;
  @Autowired private DbTruncator _truncator;
  @Autowired protected TestDataFactory _dataFactory;
  @Autowired protected OrganizationService _organizationService;
  @Autowired protected PersonService _personService;
  @Autowired protected DemoOktaRepository _oktaRepo;
  @Autowired protected OrganizationInitializingService _initService;

  //    @Autowired AuditLoggerService auditLoggerServiceSpy;
  //    @Captor private ArgumentCaptor<ConsoleApiAuditEvent> auditLogCaptor;
  @Autowired protected DiseaseService _diseaseService;
  @Autowired private SupportedDiseaseRepository _diseaseRepo;
  //  @Autowired private FacilityRepository _facilityRepo;

  //    protected Date _testStart;

  @BeforeAll
  static void configuration() {
    SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
  }

  //    @BeforeEach
  //    void setup() {
  //        _initService.initAll();
  ////        _testStart = new Date();
  ////        reset(auditLoggerServiceSpy);
  //        _diseaseService.initDiseases();
  //    }

  protected void truncateDb() {
    _truncator.truncateAll();
  }

  protected void initSampleData() {
    _initService.initAll();
  }

  /*
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
  */

  /** REST audit event checker: includes "this is not graphql" checks" */
  /*
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
   */
}
