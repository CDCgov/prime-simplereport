package gov.cdc.usds.simplereport.idp.repository;

import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.model.errors.ConflictingUserException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.config.authorization.PermissionHolder;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import java.util.Collection;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.openapitools.client.model.UserStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.support.ScopeNotActiveException;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/** Handles all user/organization management in Okta */
@Profile(BeanProfiles.NO_OKTA_MGMT)
@Service
@Slf4j
public class DemoOktaRepository implements OktaRepository {

  @Value("${simple-report.authorization.environment-name:DEV}")
  private String environment;

  private final OrganizationExtractor organizationExtractor;
  private final CurrentTenantDataAccessContextHolder tenantDataContextHolder;

  Map<String, OrganizationRoleClaims> usernameOrgRolesMap;
  Map<String, Set<String>> orgUsernamesMap;
  Map<String, Set<UUID>> orgFacilitiesMap;
  Set<String> inactiveUsernames;
  Set<String> allUsernames;
  private final Set<String> adminGroupMemberSet;

  public DemoOktaRepository(
      OrganizationExtractor extractor,
      CurrentTenantDataAccessContextHolder contextHolder,
      DemoUserConfiguration demoUserConfiguration) {
    this.usernameOrgRolesMap = new HashMap<>();
    this.orgUsernamesMap = new HashMap<>();
    this.orgFacilitiesMap = new HashMap<>();
    this.inactiveUsernames = new HashSet<>();
    this.allUsernames = new HashSet<>();

    this.organizationExtractor = extractor;
    this.tenantDataContextHolder = contextHolder;
    this.adminGroupMemberSet =
        demoUserConfiguration.getSiteAdminEmails().stream().collect(Collectors.toUnmodifiableSet());

    log.info("Done initializing Demo Okta repository.");
  }

  public Optional<OrganizationRoleClaims> createUser(
      IdentityAttributes userIdentity,
      Organization org,
      Set<Facility> facilities,
      Set<OrganizationRole> roles,
      boolean active) {
    if (allUsernames.contains(userIdentity.getUsername())) {
      throw new ConflictingUserException();
    }

    String organizationExternalId = org.getExternalId();
    Set<OrganizationRole> rolesToCreate = EnumSet.of(OrganizationRole.getDefault());
    rolesToCreate.addAll(roles);
    Set<UUID> facilityUUIDs =
        PermissionHolder.grantsAllFacilityAccess(rolesToCreate)
            // create an empty set of facilities if user can access all facilities anyway
            ? Set.of()
            : facilities.stream().map(Facility::getInternalId).collect(Collectors.toSet());
    if (!orgFacilitiesMap.containsKey(organizationExternalId)) {
      throw new IllegalGraphqlArgumentException(
          "Cannot add Okta user to nonexistent organization=" + organizationExternalId);
    } else if (!orgFacilitiesMap.get(organizationExternalId).containsAll(facilityUUIDs)) {
      throw new IllegalGraphqlArgumentException(
          "Cannot add Okta user to one or more nonexistent facilities in facilities_set="
              + facilities.stream().map(f -> f.getFacilityName()).collect(Collectors.toSet())
              + " in organization="
              + organizationExternalId);
    }

    OrganizationRoleClaims orgRoles =
        new OrganizationRoleClaims(organizationExternalId, facilityUUIDs, rolesToCreate);
    usernameOrgRolesMap.put(userIdentity.getUsername(), orgRoles);
    allUsernames.add(userIdentity.getUsername());

    orgUsernamesMap.get(organizationExternalId).add(userIdentity.getUsername());

    if (!active) {
      inactiveUsernames.add(userIdentity.getUsername());
    }

    return Optional.of(orgRoles);
  }

  // this method currently doesn't do much in a demo envt
  public Optional<OrganizationRoleClaims> updateUser(IdentityAttributes userIdentity) {
    if (!usernameOrgRolesMap.containsKey(userIdentity.getUsername())) {
      throw new IllegalGraphqlArgumentException(
          "Cannot change name of Okta user with unrecognized username");
    }
    OrganizationRoleClaims orgRoles = usernameOrgRolesMap.get(userIdentity.getUsername());
    return Optional.of(orgRoles);
  }

  public Optional<OrganizationRoleClaims> updateUserEmail(
      IdentityAttributes userIdentity, String newEmail) {
    String currentEmail = userIdentity.getUsername();
    if (!usernameOrgRolesMap.containsKey(currentEmail)) {
      throw new IllegalGraphqlArgumentException(
          "Cannot change email of Okta user with unrecognized username");
    }

    if (usernameOrgRolesMap.containsKey(newEmail)) {
      throw new ConflictingUserException();
    }

    String org = usernameOrgRolesMap.get(userIdentity.getUsername()).getOrganizationExternalId();
    orgUsernamesMap.get(org).remove(currentEmail);
    orgUsernamesMap.get(org).add(newEmail);
    usernameOrgRolesMap.put(newEmail, usernameOrgRolesMap.remove(userIdentity.getUsername()));
    OrganizationRoleClaims orgRoles = usernameOrgRolesMap.get(newEmail);
    return Optional.of(orgRoles);
  }

  public void reprovisionUser(IdentityAttributes userIdentity) {
    final String username = userIdentity.getUsername();
    if (!usernameOrgRolesMap.containsKey(username)) {
      throw new IllegalGraphqlArgumentException(
          "Cannot reprovision Okta user with unrecognized username");
    }
    if (!inactiveUsernames.contains(username)) {
      throw new IllegalGraphqlArgumentException(
          "Cannot reprovision user in unsupported state: (not deleted)");
    }

    // Only re-enable the user.  If name attributes and credentials were supported here, then
    // the name should be updated and credentials reset.
    inactiveUsernames.remove(userIdentity.getUsername());
  }

  public Optional<OrganizationRoleClaims> updateUserPrivileges(
      String username, Organization org, Set<Facility> facilities, Set<OrganizationRole> roles) {
    String orgId = org.getExternalId();
    if (!orgUsernamesMap.containsKey(orgId)) {
      throw new IllegalGraphqlArgumentException(
          "Cannot update Okta user privileges for nonexistent organization.");
    }
    if (!orgUsernamesMap.get(orgId).contains(username)) {
      throw new IllegalGraphqlArgumentException(
          "Cannot update Okta user privileges for organization they are not in.");
    }
    Set<OrganizationRole> newRoles = EnumSet.of(OrganizationRole.getDefault());
    newRoles.addAll(roles);
    Set<UUID> facilityUUIDs =
        facilities.stream()
            // create an empty set of facilities if user can access all facilities anyway
            .filter(f -> !PermissionHolder.grantsAllFacilityAccess(newRoles))
            .map(f -> f.getInternalId())
            .collect(Collectors.toSet());
    OrganizationRoleClaims newRoleClaims =
        new OrganizationRoleClaims(orgId, facilityUUIDs, newRoles);
    usernameOrgRolesMap.put(username, newRoleClaims);

    return Optional.of(newRoleClaims);
  }

  public void resetUserPassword(String username) {
    if (!usernameOrgRolesMap.containsKey(username)) {
      throw new IllegalGraphqlArgumentException(
          "Cannot reset password for Okta user with unrecognized username");
    }
  }

  public void resetUserMfa(String username) {
    if (!usernameOrgRolesMap.containsKey(username)) {
      throw new IllegalGraphqlArgumentException(
          "Cannot reset MFA for Okta user with unrecognized username");
    }
  }

  public void setUserIsActive(String username, boolean active) {
    if (active) {
      inactiveUsernames.remove(username);
    } else {
      inactiveUsernames.add(username);
    }
  }

  public UserStatus getUserStatus(String username) {
    if (inactiveUsernames.contains(username)) {
      return UserStatus.DEPROVISIONED;
    } else {
      return UserStatus.ACTIVE;
    }
  }

  public void reactivateUser(String username) {
    if (inactiveUsernames.contains(username)) {
      inactiveUsernames.remove(username);
    }
  }

  public void resendActivationEmail(String username) {
    if (!usernameOrgRolesMap.containsKey(username)) {
      throw new IllegalGraphqlArgumentException(
          "Cannot reset password for Okta user with unrecognized username");
    }
  }

  // returns ALL users including inactive ones
  public Set<String> getAllUsersForOrganization(Organization org) {
    if (!orgUsernamesMap.containsKey(org.getExternalId())) {
      throw new IllegalGraphqlArgumentException(
          "Cannot get Okta users from nonexistent organization.");
    }
    return orgUsernamesMap.get(org.getExternalId()).stream()
        .collect(Collectors.toUnmodifiableSet());
  }

  public Map<String, UserStatus> getAllUsersWithStatusForOrganization(Organization org) {
    if (!orgUsernamesMap.containsKey(org.getExternalId())) {
      throw new IllegalGraphqlArgumentException(
          "Cannot get Okta users from nonexistent organization.");
    }
    return orgUsernamesMap.get(org.getExternalId()).stream()
        .collect(Collectors.toMap(u -> u, u -> getUserStatus(u)));
  }

  // this method doesn't mean much in a demo env
  public void createOrganization(Organization org) {
    String externalId = org.getExternalId();
    orgUsernamesMap.putIfAbsent(externalId, new HashSet<>());
    orgFacilitiesMap.putIfAbsent(externalId, new HashSet<>());
  }

  // this method means nothing in a demo env
  public void activateOrganization(Organization org) {
    inactiveUsernames.removeAll(orgUsernamesMap.get(org.getExternalId()));
  }

  // this method means nothing in a demo env
  public String activateOrganizationWithSingleUser(Organization org) {
    activateOrganization(org);
    return "activationToken";
  }

  public List<String> fetchAdminUserEmail(Organization org) {
    Set<Entry<String, OrganizationRoleClaims>> admins =
        usernameOrgRolesMap.entrySet().stream()
            .filter(e -> e.getValue().getGrantedRoles().contains(OrganizationRole.ADMIN))
            .collect(Collectors.toSet());
    return admins.stream().map(Entry::getKey).collect(Collectors.toList());
  }

  public void createFacility(Facility facility) {
    String orgExternalId = facility.getOrganization().getExternalId();
    if (!orgFacilitiesMap.containsKey(orgExternalId)) {
      throw new IllegalGraphqlArgumentException(
          "Cannot create Okta facility in nonexistent organization.");
    }
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
    if (!orgFacilitiesMap.containsKey(orgExternalId)) {
      throw new IllegalGraphqlArgumentException(
          "Cannot delete Okta facility from nonexistent organization.");
    }
    orgFacilitiesMap.get(orgExternalId).remove(facility.getInternalId());
    // remove this facility from every user's OrganizationRoleClaims, as necessary
    usernameOrgRolesMap =
        usernameOrgRolesMap.entrySet().stream()
            .collect(
                Collectors.toMap(
                    e -> e.getKey(),
                    e -> {
                      OrganizationRoleClaims oldRoleClaims = e.getValue();
                      Set<UUID> newFacilities =
                          oldRoleClaims.getFacilities().stream()
                              .filter(f -> !f.equals(facility.getInternalId()))
                              .collect(Collectors.toSet());
                      return new OrganizationRoleClaims(
                          orgExternalId, newFacilities, oldRoleClaims.getGrantedRoles());
                    }));
  }

  private Optional<OrganizationRoleClaims> getOrganizationRoleClaimsFromTenantDataAccess(
      Collection<String> groupNames) {
    List<OrganizationRoleClaims> claims = organizationExtractor.convertClaims(groupNames);

    if (claims.size() != 1) {
      log.warn("User is in {} Okta organizations, not 1", claims.size());
      return Optional.empty();
    }
    return Optional.of(claims.get(0));
  }

  public Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(String username) {
    // when accessing tenant data, bypass okta and get org from the altered authorities
    try {
      if (tenantDataContextHolder.hasBeenPopulated()
          && username.equals(tenantDataContextHolder.getUsername())) {
        return getOrganizationRoleClaimsFromTenantDataAccess(
            tenantDataContextHolder.getAuthorities());
      }
      return Optional.ofNullable(usernameOrgRolesMap.get(username));
    } catch (ScopeNotActiveException e) {
      // Tests are set up with a full SecurityContextHolder and should not rely on
      // usernameOrgRolesMap as the source of truth.
      if (!("UNITTEST".equals(environment)) && usernameOrgRolesMap.containsKey(username)) {
        return Optional.of(usernameOrgRolesMap.get(username));
      }
      Set<String> authorities =
          SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
              .map(GrantedAuthority::getAuthority)
              .collect(Collectors.toSet());
      return getOrganizationRoleClaimsFromTenantDataAccess(authorities);
    }
  }

  public PartialOktaUser findUser(String username) {
    UserStatus status =
        inactiveUsernames.contains(username) ? UserStatus.DEPROVISIONED : UserStatus.ACTIVE;
    boolean isAdmin = adminGroupMemberSet.contains(username);

    Optional<OrganizationRoleClaims> orgClaims;

    try {
      orgClaims = Optional.ofNullable(usernameOrgRolesMap.get(username));
    } catch (ScopeNotActiveException e) {
      // Tests are set up with a full SecurityContextHolder and should not rely on
      // usernameOrgRolesMap as the source of truth.
      if (!("UNITTEST".equals(environment)) && usernameOrgRolesMap.containsKey(username)) {
        orgClaims = Optional.of(usernameOrgRolesMap.get(username));
      } else {
        Set<String> authorities =
            SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
        orgClaims = getOrganizationRoleClaimsFromTenantDataAccess(authorities);
      }
    }

    return PartialOktaUser.builder()
        .isSiteAdmin(isAdmin)
        .status(status)
        .username(username)
        .organizationRoleClaims(orgClaims)
        .build();
  }

  public void reset() {
    usernameOrgRolesMap.clear();
    orgUsernamesMap.clear();
    orgFacilitiesMap.clear();
    inactiveUsernames.clear();
    allUsernames.clear();
  }
}
