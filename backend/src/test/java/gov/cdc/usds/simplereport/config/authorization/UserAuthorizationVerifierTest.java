package gov.cdc.usds.simplereport.config.authorization;

import static gov.cdc.usds.simplereport.test_util.TestUserIdentities.ALL_FACILITIES_USER;
import static gov.cdc.usds.simplereport.test_util.TestUserIdentities.OTHER_ORG_ADMIN;
import static gov.cdc.usds.simplereport.test_util.TestUserIdentities.OTHER_ORG_USER;
import static gov.cdc.usds.simplereport.test_util.TestUserIdentities.STANDARD_USER;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = {"spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"})
class UserAuthorizationVerifierTest extends BaseServiceTest<UserAuthorizationVerifier> {
  @Autowired @SpyBean ApiUserRepository _apiUserRepo;
  @MockBean FeatureFlagsConfig _featureFlagsConfig;

  @BeforeEach
  public void setup() {
    initSampleData();
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportOrgAdminUser
  void userIsInSameOrg_whenOktaMigrationDisabled_forUsersInSameOrg_returnsTrue() {
    // GIVEN
    when(_featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(false);
    ApiUser user = _apiUserRepo.findByLoginEmail(ALL_FACILITIES_USER).get();
    ApiUser userSpy = spy(user);
    when(_apiUserRepo.findByIdIncludeArchived(user.getInternalId()))
        .thenReturn(Optional.of(userSpy));

    // WHEN
    boolean isSameOrg = _service.userIsInSameOrg(user.getInternalId());

    // THEN
    verify(userSpy, times(0)).getOrganizations();
    assertTrue(isSameOrg);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportOrgAdminUser
  void userIsInSameOrg_whenOktaMigrationDisabled_forUsersInDifferentOrgs_returnsFalse() {
    // GIVEN
    when(_featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(false);
    ApiUser user = _apiUserRepo.findByLoginEmail(OTHER_ORG_USER).get();
    ApiUser userSpy = spy(user);
    when(_apiUserRepo.findByIdIncludeArchived(user.getInternalId()))
        .thenReturn(Optional.of(userSpy));

    // WHEN
    boolean isSameOrg = _service.userIsInSameOrg(user.getInternalId());

    // THEN
    verify(userSpy, times(0)).getOrganizations();
    assertFalse(isSameOrg);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportOrgAdminUser
  void userIsInSameOrg_whenOktaMigrationEnabled_forUsersInSameOrg_returnsTrue() {
    // GIVEN
    when(_featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);
    ApiUser user = _apiUserRepo.findByLoginEmail(STANDARD_USER).get();
    ApiUser userSpy = spy(user);
    when(_apiUserRepo.findByIdIncludeArchived(user.getInternalId()))
        .thenReturn(Optional.of(userSpy));

    // WHEN
    boolean isSameOrg = _service.userIsInSameOrg(user.getInternalId());

    // THEN
    verify(userSpy, times(1)).getOrganizations();
    assertTrue(isSameOrg);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportEntryOnlyUser
  void userIsInSameOrg_whenOktaMigrationEnabled_forUsersInDifferentOrgs_returnsFalse() {
    // GIVEN
    when(_featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);
    ApiUser user = _apiUserRepo.findByLoginEmail(OTHER_ORG_ADMIN).get();
    ApiUser userSpy = spy(user);
    when(_apiUserRepo.findByIdIncludeArchived(user.getInternalId()))
        .thenReturn(Optional.of(userSpy));

    // WHEN
    boolean isSameOrg = _service.userIsInSameOrg(user.getInternalId());

    // THEN
    verify(userSpy, times(1)).getOrganizations();
    assertFalse(isSameOrg);
  }
}
