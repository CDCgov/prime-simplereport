package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.yannbriancon.interceptor.HibernateQueryInterceptor;
import gov.cdc.usds.simplereport.api.CurrentOrganizationRolesContextHolder;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.config.DataSourceConfiguration;
import gov.cdc.usds.simplereport.config.authorization.TenantDataAuthenticationProvider;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.function.Executable;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.AccessDeniedException;

/**
 * Base class for service-level integration. Avoids setting up servlet and web security, but sets up
 * service and persistence layer.
 *
 * <p>Note that when service-layer security is configured, it will mysteriously not work in tests
 * because security configuration is attached to a web security configuration module. (That module
 * is also on the wrong profile, so there's a significant rearrangement required regardless.)
 */
@SpringBootTest(
    properties = {
      "spring.main.web-application-type=NONE",
      "simple-report.authorization.role-prefix=" + TestUserIdentities.TEST_ROLE_PREFIX,
      "hibernate.query.interceptor.error-level=EXCEPTION"
    })
@Import({SliceTestConfiguration.class, DataSourceConfiguration.class})
@WithSimpleReportStandardUser
public abstract class BaseServiceTest<T> {

  @Autowired private DbTruncator _truncator;
  @Autowired private OrganizationInitializingService _initService;
  @Autowired protected DiseaseService _diseaseService;
  @Autowired protected SupportedDiseaseRepository _supportedDiseaseRepo;
  @MockBean private CurrentTenantDataAccessContextHolder _currentTenantDataAccessContextHolder;
  @MockBean private TenantDataAuthenticationProvider _tenantDataAuthProvider;
  @Autowired private DemoOktaRepository _oktaRepo;
  @Autowired protected TestDataFactory _dataFactory;
  @Autowired protected T _service;
  @Autowired protected HibernateQueryInterceptor _hibernateQueryInterceptor;
  @MockBean private CurrentOrganizationRolesContextHolder _currentOrganizationRolesContextHolder;

  private static final String SPRING_SECURITY_DENIED = "Access is denied";

  @BeforeEach
  protected void beforeEach() {
    clearDb();
    resetOkta();
    initCurrentUser();
    initDiseases();
    _hibernateQueryInterceptor.startQueryCount(); // also resets count
  }

  @AfterEach
  protected void afterEach() {
    // see output saved to backend/build/test-results/test
    LoggerFactory.getLogger(BaseServiceTest.class)
        .info("Hibernate Total queries: {}", _hibernateQueryInterceptor.getQueryCount());
  }

  public void clearDb() {
    _truncator.truncateAll();
  }

  public void resetOkta() {
    _oktaRepo.reset();
  }

  protected void initSampleData() {
    _initService.initAll();
  }

  protected void initCurrentUser() {
    _initService.initCurrentUser();
  }

  protected void initDiseases() {
    _diseaseService.initDiseases();
  }

  protected static void assertSecurityError(Executable e) {
    AccessDeniedException exception = assertThrows(AccessDeniedException.class, e);
    assertEquals(SPRING_SECURITY_DENIED, exception.getMessage());
  }
}
