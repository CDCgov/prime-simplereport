package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.MisconfiguredUserException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class DbOrgRoleClaimsService {
  private final ApiUserRepository _userRepo;
  private final IdentitySupplier _getCurrentUser;

  /**
   * Fetches the user by username and returns a list of OrganizationRoleClaims from the DB throws an
   * exception if user does not have ONLY one org
   *
   * @param username - String of user email/username
   * @return List of OrganizationRoleClaims from the DB
   */
  public List<OrganizationRoleClaims> getOrganizationRoleClaims(String username) {
    try {
      ApiUser user =
          _userRepo.findByLoginEmail(username).orElseThrow(NonexistentUserException::new);
      return List.of(getOrganizationRoleClaims(user));
    } catch (NonexistentUserException | MisconfiguredUserException e) {
      return new ArrayList<>();
    }
  }

  public OrganizationRoleClaims getOrganizationRoleClaims(ApiUser user) {
    Set<Organization> orgs = user.getOrganizations();
    if (orgs.size() != 1) {
      log.error("Misconfigured organizations in DB for User ID: {}", user.getInternalId());
      throw new MisconfiguredUserException();
    }
    Set<OrganizationRole> roles = user.getRoles();
    Set<UUID> facilityUUIDs =
        user.getFacilities().stream().map(Facility::getInternalId).collect(Collectors.toSet());

    String orgExternalId = orgs.stream().findFirst().get().getExternalId();
    return new OrganizationRoleClaims(orgExternalId, facilityUUIDs, roles);
  }

  /**
   * Compares two lists of OrganizationRoleClaims and checks if they are equal; If they are not
   * equal, a message is logged with the affected User ID
   *
   * @param oktaClaims - List<OrganizationRoleClaims> from Okta
   * @param dbClaims - List<OrganizationRoleClaims> from DB
   * @return boolean
   */
  public boolean checkOrgRoleClaimsEquality(
      List<OrganizationRoleClaims> oktaClaims, List<OrganizationRoleClaims> dbClaims) {
    boolean hasEqualRoleClaims = false;
    if (oktaClaims.size() == dbClaims.size()) {
      List<OrganizationRoleClaims> sanitizedOktaClaims = sanitizeOktaOrgRoleClaims(oktaClaims);
      hasEqualRoleClaims =
          sanitizedOktaClaims.stream()
              .allMatch(
                  sanitizedOktaClaim ->
                      dbClaims.stream()
                          .anyMatch(dbClaim -> equalOrgRoleClaim(sanitizedOktaClaim, dbClaim)));
    }
    if (!hasEqualRoleClaims) {
      logUnequalClaims();
    }

    return hasEqualRoleClaims;
  }

  /** Logs a message saying OrganizationRoleClaims are unequal with the affected User ID */
  private void logUnequalClaims() {
    // WIP: Currently assumes check is for the current user
    // This may change based on where checkOrgRoleClaimsEquality is called
    String username = _getCurrentUser.get().getUsername();
    ApiUser user = _userRepo.findByLoginEmail(username).orElseThrow(NonexistentUserException::new);
    log.error(
        "Okta OrganizationRoleClaims do not match database OrganizationRoleClaims for User ID: {}",
        user.getInternalId());
  }

  /**
   * Removes NO_ACCESS OrganizationRole in order to compare with OrganizationRole from DB, NO_ACCESS
   * role does not exist in DB, only in Okta
   *
   * @param oktaClaims - List<OrganizationRoleClaims> from Okta
   * @return list of OrganizationRoleClaims without NO_ACCESS OrganizationRole
   */
  private List<OrganizationRoleClaims> sanitizeOktaOrgRoleClaims(
      List<OrganizationRoleClaims> oktaClaims) {
    return oktaClaims.stream()
        .map(
            oktaClaim -> {
              Set<OrganizationRole> orgRoles =
                  oktaClaim.getGrantedRoles().stream()
                      .filter(c -> c != OrganizationRole.NO_ACCESS)
                      .collect(Collectors.toSet());
              return new OrganizationRoleClaims(
                  oktaClaim.getOrganizationExternalId(), oktaClaim.getFacilities(), orgRoles);
            })
        .collect(Collectors.toList());
  }

  /**
   * Compares two OrganizationRoleClaims for equality
   *
   * @param oktaClaim - OrganizationRoleClaims from Okta
   * @param dbClaim - OrganizationRoleClaims from DB
   * @return boolean
   */
  private boolean equalOrgRoleClaim(
      OrganizationRoleClaims oktaClaim, OrganizationRoleClaims dbClaim) {
    Set<OrganizationRole> oktaOrgRoles = oktaClaim.getGrantedRoles();
    Set<OrganizationRole> dbOrgRoles = dbClaim.getGrantedRoles();
    boolean equalRoles = CollectionUtils.isEqualCollection(oktaOrgRoles, dbOrgRoles);

    Set<UUID> oktaFacilities = oktaClaim.getFacilities();
    Set<UUID> dbFacilities = dbClaim.getFacilities();
    boolean equalFacilities = CollectionUtils.isEqualCollection(oktaFacilities, dbFacilities);

    String oktaExternalOrgId = oktaClaim.getOrganizationExternalId();
    String dbExternalOrgId = dbClaim.getOrganizationExternalId();
    boolean equalOrg = StringUtils.equals(oktaExternalOrgId, dbExternalOrgId);

    return equalRoles && equalFacilities && equalOrg;
  }
}
