package gov.cdc.usds.simplereport.idp.repository;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/** Handles all user/organization management in Okta */
@Profile(BeanProfiles.NO_OKTA_MGMT)
@Service
public class DemoOktaRepository implements OktaRepository {

  private static final Logger LOG = LoggerFactory.getLogger(DemoOktaRepository.class);

  Map<String, OrganizationRoleClaims> usernameOrgRolesMap;
  Map<String, Set<String>> orgUsernamesMap;
  Map<String, Set<UUID>> orgFacilitiesMap;
  Set<String> inactiveUsernames;

  public DemoOktaRepository() {
    this.usernameOrgRolesMap = new HashMap<>();
    this.orgUsernamesMap = new HashMap<>();
    this.orgFacilitiesMap = new HashMap<>();
    this.inactiveUsernames = new HashSet<>();

    LOG.info("Done initializing Demo Okta repository.");
  }

  public Optional<OrganizationRoleClaims> createUser(
      IdentityAttributes userIdentity, Organization org, Optional<Set<Facility>> facilities, OrganizationRole role) {
    String organizationExternalId = org.getExternalId();
    Set<OrganizationRole> roles = EnumSet.of(OrganizationRole.getDefault(), role);
    Optional<Set<UUID>> facilityRestrictions = facilities.map(f_set -> f_set.stream()
        .map(f->f.getInternalId()).collect(Collectors.toSet()));

    OrganizationRoleClaims orgRoles = new OrganizationRoleClaims(organizationExternalId, facilityRestrictions, roles);
    usernameOrgRolesMap.putIfAbsent(userIdentity.getUsername(), orgRoles);

    orgUsernamesMap.get(organizationExternalId).add(userIdentity.getUsername());

    return Optional.of(orgRoles);
  }

  public Optional<OrganizationRoleClaims> updateUser(
      String oldUsername, IdentityAttributes userIdentity) {
    OrganizationRoleClaims orgRoles = usernameOrgRolesMap.put(userIdentity.getUsername(), 
                                                              usernameOrgRolesMap.remove(oldUsername));
    orgUsernamesMap.values().forEach(usernames -> {
      if (usernames.remove(oldUsername)) {
        usernames.add(userIdentity.getUsername());
      }
    });

    return Optional.of(orgRoles);
  }

  public Optional<OrganizationRoleClaims> updateUserRole(
      String username, Organization org, OrganizationRole role) {
    String orgId = org.getExternalId();
    if (!orgUsernamesMap.get(orgId).contains(username)) {
      throw new IllegalGraphqlArgumentException(
          "Cannot update user role for organization they are not in.");
    }
    OrganizationRoleClaims oldRoleClaims = usernameOrgRolesMap.get(username);
    Set<OrganizationRole> roles = EnumSet.of(OrganizationRole.getDefault(), role);
    OrganizationRoleClaims newRoleClaims = new OrganizationRoleClaims(orgId, 
                                                                      oldRoleClaims.getFacilityRestrictions(), 
                                                                      roles);
    usernameOrgRolesMap.put(username, newRoleClaims);

    return Optional.of(newRoleClaims);
  }

  public void setUserIsActive(String username, Boolean active) {
    if (active) {
      inactiveUsernames.remove(username);
    } else if (!active) {
      inactiveUsernames.add(username);
    }
  }

  public Map<String, OrganizationRoleClaims> getAllUsersForOrganization(Organization org) {
    return orgUsernamesMap.get(org.getExternalId()).stream()
        .filter(u -> !inactiveUsernames.contains(u))
        .collect(Collectors.toMap(u -> u, u -> usernameOrgRolesMap.get(u)));
  }

  public void createOrganization(Organization org) {
    String externalId = org.getExternalId();
    orgUsernamesMap.put(externalId, new HashSet<>());
    orgFacilitiesMap.put(externalId, new HashSet<>());
  }

  public void createFacility(Facility facility) {
    String orgExternalId = facility.getOrganization().getExternalId();
    orgFacilitiesMap.get(orgExternalId).add(facility.getInternalId());
  }

  public void deleteOrganization(Organization org) {
    String externalId = org.getExternalId();
    orgUsernamesMap.remove(externalId);
    orgFacilitiesMap.remove(externalId);
    // remove all users from this map whose org roles are in the deleted org
    usernameOrgRolesMap =
        usernameOrgRolesMap.entrySet().stream()
            .filter(e -> !(e.getValue().getOrganizationExternalId().equals(externalId)))
            .collect(Collectors.toMap(e -> e.getKey(), e -> e.getValue()));
  }

  public void deleteFacility(Facility facility) {
    String orgExternalId = facility.getOrganization().getExternalId();
    orgFacilitiesMap.get(orgExternalId).remove(facility.getInternalId());
    // remove this facility from every user's OrganizationRoleClaims, as necessary
    usernameOrgRolesMap = usernameOrgRolesMap.entrySet().stream()
        .collect(Collectors.toMap(e -> e.getKey(), 
                                  e -> {
            OrganizationRoleClaims oldRoleClaims = e.getValue();
            Optional<Set<UUID>> newFacilityRestrictions = 
                oldRoleClaims.getFacilityRestrictions().map(f_set -> f_set.stream()
                    .filter(f -> !f.equals(facility.getInternalId()))
                    .collect(Collectors.toSet()));
            return new OrganizationRoleClaims(orgExternalId, 
                                              newFacilityRestrictions, 
                                              oldRoleClaims.getGrantedRoles());
        }));
  }

  public Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(String username) {
    if (inactiveUsernames.contains(username)) {
      return Optional.empty();
    } else {
      return Optional.ofNullable(usernameOrgRolesMap.get(username));
    }
  }

  public void reset() {
    usernameOrgRolesMap.clear();
    orgUsernamesMap.clear();
    orgFacilitiesMap.clear();
    inactiveUsernames.clear();
  }
}
