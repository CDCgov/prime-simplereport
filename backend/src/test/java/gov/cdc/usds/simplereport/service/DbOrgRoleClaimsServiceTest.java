package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.errors.MisconfiguredUserException;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.test_util.OrganizationRoleClaimsTestUtils;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = {"spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"})
class DbOrgRoleClaimsServiceTest extends BaseServiceTest<DbOrgRoleClaimsService> {
  @Autowired OrganizationRoleClaimsTestUtils _orgRoleClaimsTestUtils;
  @Autowired OrganizationService _organizationService;
  @SpyBean ApiUserRepository _apiUserRepoSpy;

  @Test
  void getOrganizationRoleClaims_withEmail_success() {
    initSampleData();
    final String email = TestUserIdentities.STANDARD_USER;
    Mockito.reset(_apiUserRepoSpy);

    List<OrganizationRoleClaims> orgRoleClaims = _service.getOrganizationRoleClaims(email);

    verify(_apiUserRepoSpy, times(1)).findByLoginEmail(email);
    assertEquals(1, orgRoleClaims.size());
    assertEquals(
        Collections.unmodifiableSet(EnumSet.of(OrganizationRole.USER)),
        orgRoleClaims.stream().findFirst().get().getGrantedRoles());

    Set<UUID> facilityIds = orgRoleClaims.stream().findFirst().get().getFacilities();
    assertEquals(1, facilityIds.size());
    Facility facility =
        _organizationService.getFacilityById(facilityIds.stream().findFirst().get()).get();
    assertEquals("Injection Site", facility.getFacilityName());
  }

  @Test
  void getOrganizationRoleClaims_withEmail_nonExistentUser_success() {
    final String email = "nonexistentuser@fake.com";
    Mockito.reset(_apiUserRepoSpy);

    List<OrganizationRoleClaims> orgRoleClaims = _service.getOrganizationRoleClaims(email);

    verify(_apiUserRepoSpy, times(1)).findByLoginEmail(email);
    assertThat(orgRoleClaims).isEmpty();
  }

  @Test
  void getOrganizationRoleClaims_withEmail_withMultipleOrgs_success() {
    Organization gwu =
        _dataFactory.saveOrganization("George Washington", "university", "gwu", true);
    Organization gtown = _dataFactory.saveOrganization("Georgetown", "university", "gt", true);
    final String email = TestUserIdentities.STANDARD_USER;
    ApiUser mockApiUser = mock(ApiUser.class);
    when(mockApiUser.getOrganizations()).thenReturn(Set.of(gwu, gtown));
    when(_apiUserRepoSpy.findByLoginEmail(email)).thenReturn(Optional.of(mockApiUser));

    List<OrganizationRoleClaims> orgRoleClaims = _service.getOrganizationRoleClaims(email);
    assertThat(orgRoleClaims).isEmpty();
  }

  @Test
  void getOrganizationRoleClaims_withApiUser_withMultipleOrgs_throws() {
    Organization gwu =
        _dataFactory.saveOrganization("George Washington", "university", "gwu", true);
    Organization gtown = _dataFactory.saveOrganization("Georgetown", "university", "gt", true);
    final String email = TestUserIdentities.STANDARD_USER;
    ApiUser apiUser = _apiUserRepoSpy.findByLoginEmail(email).get();
    ApiUser mockApiUser = mock(ApiUser.class);
    when(mockApiUser.getOrganizations()).thenReturn(Set.of(gwu, gtown));

    assertThrows(
        MisconfiguredUserException.class, () -> _service.getOrganizationRoleClaims(apiUser));
  }

  @Test
  void checkOrgRoleClaimsEquality_withIdenticalOrgRoleClaims_inDifferentOrder_isTrue() {
    OrganizationRoleClaims firstOktaClaim =
        _orgRoleClaimsTestUtils.createOrgRoleClaims(
            OrganizationRoleClaimsTestUtils.OKTA_ORG_EXTERNAL_ID,
            OrganizationRoleClaimsTestUtils.OKTA_FACILITY_NAMES,
            Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.USER));

    OrganizationRoleClaims firstDbClaim =
        createClaimsForCreatedOrg(
            OrganizationRoleClaimsTestUtils.OKTA_ORG_EXTERNAL_ID, Set.of(OrganizationRole.USER));

    OrganizationRoleClaims secondOktaClaim =
        _orgRoleClaimsTestUtils.createOrgRoleClaims(
            OrganizationRoleClaimsTestUtils.DB_ORG_EXTERNAL_ID,
            OrganizationRoleClaimsTestUtils.DB_FACILITY_NAMES,
            Set.of(
                OrganizationRole.NO_ACCESS,
                OrganizationRole.ADMIN,
                OrganizationRole.ALL_FACILITIES));

    OrganizationRoleClaims secondDbClaim =
        createClaimsForCreatedOrg(
            OrganizationRoleClaimsTestUtils.DB_ORG_EXTERNAL_ID,
            Set.of(OrganizationRole.ALL_FACILITIES, OrganizationRole.ADMIN));

    assertTrue(
        _service.checkOrgRoleClaimsEquality(
            List.of(secondOktaClaim, firstOktaClaim), List.of(firstDbClaim, secondDbClaim)));
  }

  @Test
  void checkOrgRoleClaimsEquality_withDifferentRoleOrder_isTrue() {
    OrganizationRoleClaims oktaClaim =
        _orgRoleClaimsTestUtils.createOrgRoleClaims(
            OrganizationRoleClaimsTestUtils.OKTA_ORG_EXTERNAL_ID,
            OrganizationRoleClaimsTestUtils.OKTA_FACILITY_NAMES,
            Set.of(
                OrganizationRole.NO_ACCESS,
                OrganizationRole.USER,
                OrganizationRole.ALL_FACILITIES));

    OrganizationRoleClaims dbClaim =
        createClaimsForCreatedOrg(
            OrganizationRoleClaimsTestUtils.OKTA_ORG_EXTERNAL_ID,
            Set.of(OrganizationRole.ALL_FACILITIES, OrganizationRole.USER));

    assertTrue(_service.checkOrgRoleClaimsEquality(List.of(oktaClaim), List.of(dbClaim)));
  }

  @Test
  void checkOrgRoleClaimsEquality_withDifferentOrgClaims_isFalse() {
    OrganizationRoleClaims oktaClaim =
        _orgRoleClaimsTestUtils.createOrgRoleClaims(
            OrganizationRoleClaimsTestUtils.OKTA_ORG_EXTERNAL_ID,
            OrganizationRoleClaimsTestUtils.OKTA_FACILITY_NAMES,
            Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.USER));
    OrganizationRoleClaims dbClaim =
        _orgRoleClaimsTestUtils.createOrgRoleClaims(
            OrganizationRoleClaimsTestUtils.DB_ORG_EXTERNAL_ID,
            OrganizationRoleClaimsTestUtils.DB_FACILITY_NAMES,
            Set.of(OrganizationRole.ADMIN, OrganizationRole.ALL_FACILITIES));

    Mockito.reset(_apiUserRepoSpy);

    assertFalse(_service.checkOrgRoleClaimsEquality(List.of(oktaClaim), List.of(dbClaim)));
    verify(_apiUserRepoSpy, times(1)).findByLoginEmail(any());
  }

  @Test
  void checkOrgRoleClaimsEquality_withDifferentOrgClaimsSize_isFalse() {
    OrganizationRoleClaims oktaClaim =
        _orgRoleClaimsTestUtils.createOrgRoleClaims(
            OrganizationRoleClaimsTestUtils.OKTA_ORG_EXTERNAL_ID,
            OrganizationRoleClaimsTestUtils.OKTA_FACILITY_NAMES,
            Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.USER));

    assertFalse(_service.checkOrgRoleClaimsEquality(List.of(oktaClaim), List.of()));
  }

  private OrganizationRoleClaims createClaimsForCreatedOrg(
      String orgExternalId, Set<OrganizationRole> orgRoles) {
    Organization org = _organizationService.getOrganization(orgExternalId);
    List<Facility> facilities = _organizationService.getFacilities(org);
    Set<UUID> facilityIds =
        facilities.stream().map(Facility::getInternalId).collect(Collectors.toSet());
    return new OrganizationRoleClaims(orgExternalId, facilityIds, orgRoles);
  }
}
