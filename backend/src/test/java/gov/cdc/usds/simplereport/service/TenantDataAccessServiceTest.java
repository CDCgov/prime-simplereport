package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import org.apache.commons.collections.CollectionUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class TenantDataAccessServiceTest extends BaseServiceTest<TenantDataAccessService> {

  @Autowired private ApiUserService _userService;
  @Autowired private AuthorizationProperties _authProperties;

  @Test
  void addTenantDataAccess_success() {
    ApiUser apiUser = _userService.getCurrentApiUserInContainedTransaction();
    Organization org = _dataFactory.createValidOrg();
    String justification = "Test justification";

    Optional<OrganizationRoleClaims> claimsOpt =
        _service.addTenantDataAccess(apiUser, org, justification);
    assertTrue(claimsOpt.isPresent());

    OrganizationRoleClaims claims = claimsOpt.get();
    assertEquals(org.getExternalId(), claims.getOrganizationExternalId());
    assertTrue(
        CollectionUtils.isEqualCollection(
            Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.ADMIN), claims.getGrantedRoles()));
  }

  @Test
  void addAndRemoveDataAccess_success() {
    ApiUser apiUser = _userService.getCurrentApiUserInContainedTransaction();
    Organization org = _dataFactory.createValidOrg();
    String justification = "Test justification";

    // set access for a user to an org
    _service.addTenantDataAccess(apiUser, org, justification);

    Optional<Set<String>> authorityNames = _service.getTenantDataAccessAuthorityNames(apiUser);
    assertTrue(authorityNames.isPresent());
    assertTrue(
        CollectionUtils.isEqualCollection(getExpectedAuthoritiesForOrg(org), authorityNames.get()));

    _service.removeAllTenantDataAccess(apiUser);

    // expect no tenant data access after removal
    authorityNames = _service.getTenantDataAccessAuthorityNames(apiUser);
    assertTrue(authorityNames.isEmpty());
  }

  private Set<String> getExpectedAuthoritiesForOrg(Organization org) {
    Set<String> expectedAuthorities = new HashSet<>();
    expectedAuthorities.add(_authProperties.getAdminGroupName());
    expectedAuthorities.add(
        _authProperties.getRolePrefix()
            + org.getExternalId()
            + ":"
            + OrganizationRole.getDefault());
    expectedAuthorities.add(
        _authProperties.getRolePrefix() + org.getExternalId() + ":" + OrganizationRole.ADMIN);

    return expectedAuthorities;
  }
}
