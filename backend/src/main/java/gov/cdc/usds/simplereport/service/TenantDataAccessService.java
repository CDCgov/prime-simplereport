package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.TenantDataAccess;
import gov.cdc.usds.simplereport.db.model.auxiliary.PermissionsData;
import gov.cdc.usds.simplereport.db.repository.TenantDataAccessRepository;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = false)
public class TenantDataAccessService {

  private static final int VALID_MINUTES = 60;

  private static final Logger LOG = LoggerFactory.getLogger(TenantDataAccessService.class);

  @Autowired private TenantDataAccessRepository _repo;
  @Autowired private CurrentTenantDataAccessContextHolder _contextHolder;
  @Autowired private AuthorizationProperties _authProperties;
  @Autowired private OrganizationExtractor _extractor;

  public Optional<Set<String>> getTenantDataAccessAuthorityNames(ApiUser apiUser) {
    List<TenantDataAccess> tenantDataAccessList =
        _repo.findValidByApiUserId(apiUser.getInternalId());
    if (tenantDataAccessList.isEmpty()) {
      return Optional.empty();
    } else if (tenantDataAccessList.size() != 1) {
      // there should only be 1 valid tenant data access.  to clean this up, remove all
      removeAllTenantDataAccess(apiUser);
      return Optional.empty();
    }

    PermissionsData permissionsData = tenantDataAccessList.get(0).getPermissionsData();
    return Optional.of(permissionsData.getAuthorities());
  }

  public Optional<OrganizationRoleClaims> addTenantDataAccess(
      ApiUser apiUser, Organization org, String justification) {
    // ensure user has no current valid tenant access
    removeAllTenantDataAccess(apiUser);

    Calendar calendar = Calendar.getInstance();
    calendar.setTime(new Date());
    calendar.add(Calendar.MINUTE, VALID_MINUTES);
    Date expirationDate = calendar.getTime();

    String prefix = _authProperties.getRolePrefix();
    Set<String> authorities = new HashSet<>();

    // retain site admin privileges, in the future it may be nice to drop these
    authorities.add(_authProperties.getAdminGroupName());

    // authority names for the org being accessed (assume org-level admin in the tenant)
    authorities.add(prefix + org.getExternalId() + ":" + OrganizationRole.getDefault());
    authorities.add(prefix + org.getExternalId() + ":" + OrganizationRole.ADMIN);

    PermissionsData permissionsData = new PermissionsData(authorities);

    _repo.save(new TenantDataAccess(apiUser, org, permissionsData, justification, expirationDate));

    List<OrganizationRoleClaims> roleClaimsList =
        _extractor.convertClaims(permissionsData.getAuthorities());
    Optional<OrganizationRoleClaims> roleClaims = Optional.of(roleClaimsList.get(0));

    LOG.info(
        "** addTenantDataAccess for user: {} to org {}",
        apiUser.getInternalId(),
        org.getInternalId());

    return roleClaims;
  }

  public void removeAllTenantDataAccess(ApiUser apiUser) {
    _repo.findValidByApiUserId(apiUser.getInternalId()).forEach(i -> i.setIsDeleted(true));
    _contextHolder.reset();
  }
}
