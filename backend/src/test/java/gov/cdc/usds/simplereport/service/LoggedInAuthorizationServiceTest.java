package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.service.errors.NobodyAuthenticatedException;
import gov.cdc.usds.simplereport.test_util.OrganizationRoleClaimsTestUtils;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.security.core.context.SecurityContextHolder;

class LoggedInAuthorizationServiceTest extends BaseServiceTest<AuthorizationService> {
  @Autowired TenantDataAccessService tenantDataAccessService;
  @Autowired @SpyBean ApiUserRepository apiUserRepository;
  @Autowired OrganizationRoleClaimsTestUtils _orgRoleClaimsTestUtils;

  @Test
  void findAllOrganizationRoles_NobodyAuthenticatedException() {
    SecurityContextHolder.getContext().setAuthentication(null);
    assertThrows(NobodyAuthenticatedException.class, () -> _service.findAllOrganizationRoles());
  }

  @Test
  void findAllOrganizationRoles_whenOktaMigrationDisabled_returnsRoleFromOkta() {
    // GIVEN
    AuthorizationService mockLoggedInAuthorizationService = getMockAuthService(false);

    // WHEN
    List<OrganizationRoleClaims> orgRoleClaims =
        mockLoggedInAuthorizationService.findAllOrganizationRoles();

    // THEN
    assertEquals(1, orgRoleClaims.size());
    OrganizationRoleClaims orgRoleClaim = orgRoleClaims.get(0);
    assertEquals(
        Collections.unmodifiableSet(EnumSet.of(OrganizationRole.NO_ACCESS, OrganizationRole.USER)),
        orgRoleClaim.getGrantedRoles());
    assertTrue(
        _orgRoleClaimsTestUtils.facilitiesEqual(
            OrganizationRoleClaimsTestUtils.OKTA_FACILITY_NAMES, orgRoleClaim.getFacilities()));
    assertEquals(
        OrganizationRoleClaimsTestUtils.OKTA_ORG_EXTERNAL_ID,
        orgRoleClaim.getOrganizationExternalId());
  }

  @Test
  void findAllOrganizationRoles_whenOktaMigrationEnabled_returnsRoleFromDB() {
    // GIVEN
    AuthorizationService mockLoggedInAuthorizationService = getMockAuthService(true);

    // WHEN
    List<OrganizationRoleClaims> orgRoleClaims =
        mockLoggedInAuthorizationService.findAllOrganizationRoles();

    // THEN
    assertEquals(1, orgRoleClaims.size());
    OrganizationRoleClaims orgRoleClaim = orgRoleClaims.get(0);
    assertEquals(
        Collections.unmodifiableSet(
            EnumSet.of(OrganizationRole.ALL_FACILITIES, OrganizationRole.ADMIN)),
        orgRoleClaim.getGrantedRoles());
    assertTrue(
        _orgRoleClaimsTestUtils.facilitiesEqual(
            _orgRoleClaimsTestUtils.DB_FACILITY_NAMES, orgRoleClaim.getFacilities()));
    assertEquals(
        _orgRoleClaimsTestUtils.DB_ORG_EXTERNAL_ID, orgRoleClaim.getOrganizationExternalId());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void findAllOrganizationRoles_whenOktaMigrationEnabled_doesNotFetchFromDB_forSiteAdmin() {
    // GIVEN
    AuthorizationProperties authProps = new AuthorizationProperties(null, "UNITTEST");
    OrganizationRoleClaims dbClaims =
        _orgRoleClaimsTestUtils.createOrgRoleClaims(
            _orgRoleClaimsTestUtils.DB_ORG_EXTERNAL_ID,
            _orgRoleClaimsTestUtils.DB_FACILITY_NAMES,
            Set.of(OrganizationRole.ADMIN, OrganizationRole.ALL_FACILITIES));
    DbOrgRoleClaimsService mockDbOrgRoleClaimsService = mock(DbOrgRoleClaimsService.class);
    when(mockDbOrgRoleClaimsService.getOrganizationRoleClaims(anyString()))
        .thenReturn(List.of(dbClaims));
    FeatureFlagsConfig mockFeatureFlags = mock(FeatureFlagsConfig.class);
    when(mockFeatureFlags.isOktaMigrationEnabled()).thenReturn(false);

    LoggedInAuthorizationService mockLoggedInAuthorizationService =
        new LoggedInAuthorizationService(
            new OrganizationExtractor(authProps),
            authProps,
            mockDbOrgRoleClaimsService,
            mockFeatureFlags);

    // WHEN
    List<OrganizationRoleClaims> orgRoleClaims =
        mockLoggedInAuthorizationService.findAllOrganizationRoles();

    // THEN
    verify(mockDbOrgRoleClaimsService, times(0)).getOrganizationRoleClaims(anyString());
    assertEquals(0, orgRoleClaims.size());
  }

  private LoggedInAuthorizationService getMockAuthService(boolean isOktaMigrationEnabled) {
    FeatureFlagsConfig mockFeatureFlags = mock(FeatureFlagsConfig.class);
    when(mockFeatureFlags.isOktaMigrationEnabled()).thenReturn(isOktaMigrationEnabled);

    AuthorizationProperties authProps = new AuthorizationProperties(null, "UNITTEST");

    OrganizationRoleClaims oktaClaims =
        _orgRoleClaimsTestUtils.createOrgRoleClaims(
            _orgRoleClaimsTestUtils.OKTA_ORG_EXTERNAL_ID,
            _orgRoleClaimsTestUtils.OKTA_FACILITY_NAMES,
            Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.USER));
    OrganizationExtractor mockOrgExtractor = mock(OrganizationExtractor.class);
    when(mockOrgExtractor.convert(any())).thenReturn(List.of(oktaClaims));

    OrganizationRoleClaims dbClaims =
        _orgRoleClaimsTestUtils.createOrgRoleClaims(
            _orgRoleClaimsTestUtils.DB_ORG_EXTERNAL_ID,
            _orgRoleClaimsTestUtils.DB_FACILITY_NAMES,
            Set.of(OrganizationRole.ADMIN, OrganizationRole.ALL_FACILITIES));
    DbOrgRoleClaimsService mockDbOrgRoleClaimsService = mock(DbOrgRoleClaimsService.class);
    when(mockDbOrgRoleClaimsService.getOrganizationRoleClaims(anyString()))
        .thenReturn(List.of(dbClaims));

    return new LoggedInAuthorizationService(
        mockOrgExtractor, authProps, mockDbOrgRoleClaimsService, mockFeatureFlags);
  }
}
