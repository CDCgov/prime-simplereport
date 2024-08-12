package gov.cdc.usds.simplereport.api;

import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.getAddress;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.config.authorization.DemoAuthenticationConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.service.AddressValidationService;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

/** Base class for non-graphQL full stack tests that require authentication. */
@Slf4j
public abstract class BaseAuthenticatedFullStackTest extends BaseFullStackTest {

  protected static final String ACCESS_ERROR = "Unauthorized";

  @Autowired private OrganizationInitializingService organizationInitializingService;
  @Autowired private DemoOktaRepository oktaRepository;
  @Autowired private DemoUserConfiguration userConfiguration;
  @MockBean private AddressValidationService addressValidationService;

  @Getter @Setter private String username = null;

  protected void useOrgUser() {
    username = TestUserIdentities.STANDARD_USER;
  }

  protected void useOutsideOrgUser() {
    username = TestUserIdentities.OTHER_ORG_USER;
  }

  protected void useOrgAdmin() {
    username = TestUserIdentities.ORG_ADMIN_USER;
  }

  protected void useOutsideOrgAdmin() {
    username = TestUserIdentities.OTHER_ORG_ADMIN;
  }

  protected void useOrgEntryOnly() {
    username = TestUserIdentities.ENTRY_ONLY_USER;
  }

  protected void useOrgUserAllFacilityAccess() {
    username = TestUserIdentities.ALL_FACILITIES_USER;
  }

  protected void useSuperUser() {
    username = TestUserIdentities.SITE_ADMIN_USER;
  }

  protected void useBrokenUser() {
    username = TestUserIdentities.BROKEN_USER;
  }

  protected void useInvalidFacilitiesUser() {
    username = TestUserIdentities.INVALID_FACILITIES_USER;
  }

  @BeforeEach
  public void baseAuthenticatedFullStackTestSetup() {
    truncateDb();
    oktaRepository.reset();
    when(addressValidationService.getValidatedAddress(any())).thenReturn(getAddress());
    when(addressValidationService.getValidatedAddress(any(), any(), any(), any(), any()))
        .thenReturn(getAddress());
    TestUserIdentities.withStandardUser(organizationInitializingService::initAll);
    useOrgUser();
    assertNull(
        // Dear future reader: this is not negotiable. If you set a default user, then patients will
        // show up as being the default user instead of themselves. This would be bad.
        userConfiguration.getDefaultUser(),
        "default user should never be set in this application context");
    log.trace(
        "Usernames configured: {}",
        userConfiguration.getAllUsers().stream()
            .map(DemoUserConfiguration.DemoUser::getUsername)
            .collect(Collectors.toList()));
  }

  @AfterEach
  public void baseAuthenticatedFullStackTestCleanup() {
    truncateDb();
    username = null;
    oktaRepository.reset();
  }

  protected String getBearerAuth() {
    return DemoAuthenticationConfiguration.DEMO_AUTHORIZATION_FLAG + username;
  }
}
