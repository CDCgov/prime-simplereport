package gov.cdc.usds.simplereport.idp.repository;

import com.okta.sdk.authc.credentials.TokenClientCredentials;
import com.okta.sdk.client.Client;
import com.okta.sdk.client.Clients;
import com.okta.sdk.resource.ResourceException;
import com.okta.sdk.resource.application.Application;
import com.okta.sdk.resource.group.Group;
import com.okta.sdk.resource.group.GroupBuilder;
import com.okta.sdk.resource.group.GroupList;
import com.okta.sdk.resource.group.GroupType;
import com.okta.sdk.resource.user.User;
import com.okta.sdk.resource.user.UserBuilder;
import com.okta.sdk.resource.user.UserList;
import com.okta.sdk.resource.user.UserStatus;
import com.okta.spring.boot.sdk.config.OktaClientProperties;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.config.authorization.PermissionHolder;
import gov.cdc.usds.simplereport.config.exceptions.MisconfiguredApplicationException;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import java.util.Collection;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Created by jeremyzitomer-usds on 1/7/21
 *
 * <p>Handles all user/organization management in Okta
 */
@Profile("!" + BeanProfiles.NO_OKTA_MGMT)
@Service
public class LiveOktaRepository implements OktaRepository {

  private static final Logger LOG = LoggerFactory.getLogger(LiveOktaRepository.class);

  private static final String FILTER_TYPE_EQ_OKTA_GROUP =
      "type eq \"" + GroupType.OKTA_GROUP + "\"";

  private String _rolePrefix;
  private Client _client;
  private Application _app;
  private OrganizationExtractor _extractor;
  private CurrentTenantDataAccessContextHolder _tenantDataContextHolder;

  public LiveOktaRepository(
      AuthorizationProperties authorizationProperties,
      Client client,
      @Value("${okta.oauth2.client-id}") String oktaOAuth2ClientId,
      OrganizationExtractor organizationExtractor,
      CurrentTenantDataAccessContextHolder tenantDataContextHolder) {
    _rolePrefix = authorizationProperties.getRolePrefix();
    _client = client;
    try {
      _app = _client.getApplication(oktaOAuth2ClientId);
    } catch (ResourceException e) {
      throw new MisconfiguredApplicationException(
          "Cannot find Okta application with id=" + oktaOAuth2ClientId, e);
    }
    _extractor = organizationExtractor;
    _tenantDataContextHolder = tenantDataContextHolder;
  }

  @Autowired
  public LiveOktaRepository(
      AuthorizationProperties authorizationProperties,
      OktaClientProperties oktaClientProperties,
      @Value("${okta.oauth2.client-id}") String oktaOAuth2ClientId,
      OrganizationExtractor organizationExtractor,
      CurrentTenantDataAccessContextHolder tenantDataContextHolder) {
    _rolePrefix = authorizationProperties.getRolePrefix();
    _client =
        Clients.builder()
            .setOrgUrl(oktaClientProperties.getOrgUrl())
            .setClientCredentials(new TokenClientCredentials(oktaClientProperties.getToken()))
            .build();
    try {
      _app = _client.getApplication(oktaOAuth2ClientId);
    } catch (ResourceException e) {
      throw new MisconfiguredApplicationException(
          "Cannot find Okta application with id=" + oktaOAuth2ClientId, e);
    }
    _extractor = organizationExtractor;
    _tenantDataContextHolder = tenantDataContextHolder;
  }

  public Optional<OrganizationRoleClaims> createUser(
      IdentityAttributes userIdentity,
      Organization org,
      Set<Facility> facilities,
      Set<OrganizationRole> roles,
      boolean active) {
    // need to validate fields before adding them because Maps don't like nulls
    Map<String, Object> userProfileMap = new HashMap<String, Object>();
    if (userIdentity.getFirstName() != null && !userIdentity.getFirstName().isEmpty()) {
      userProfileMap.put("firstName", userIdentity.getFirstName());
    }
    if (userIdentity.getMiddleName() != null && !userIdentity.getMiddleName().isEmpty()) {
      userProfileMap.put("middleName", userIdentity.getMiddleName());
    }
    if (userIdentity.getLastName() != null && !userIdentity.getLastName().isEmpty()) {
      userProfileMap.put("lastName", userIdentity.getLastName());
    } else {
      // last name is required
      throw new IllegalGraphqlArgumentException("Cannot create Okta user without last name");
    }
    if (userIdentity.getSuffix() != null && !userIdentity.getSuffix().isEmpty()) {
      userProfileMap.put("honorificSuffix", userIdentity.getSuffix());
    }
    if (userIdentity.getUsername() != null && !userIdentity.getUsername().isEmpty()) {
      // we assume login == email
      userProfileMap.put("email", userIdentity.getUsername());
      userProfileMap.put("login", userIdentity.getUsername());
    } else {
      // username is required
      throw new IllegalGraphqlArgumentException("Cannot create Okta user without username");
    }

    // By default, when creating a user, we give them privileges of a standard user
    String organizationExternalId = org.getExternalId();
    Set<OrganizationRole> rolesToCreate = EnumSet.of(OrganizationRole.getDefault());
    rolesToCreate.addAll(roles);

    // Add user to new groups
    Set<String> groupNamesToAdd = new HashSet<>();
    groupNamesToAdd.addAll(
        rolesToCreate.stream()
            .map(r -> generateRoleGroupName(organizationExternalId, r))
            .collect(Collectors.toSet()));
    groupNamesToAdd.addAll(
        facilities.stream()
            // use an empty set of facilities if user can access all facilities anyway
            .filter(f -> !PermissionHolder.grantsAllFacilityAccess(rolesToCreate))
            .map(f -> generateFacilityGroupName(organizationExternalId, f.getInternalId()))
            .collect(Collectors.toSet()));

    GroupList orgGroups =
        _client.listGroups(generateGroupOrgPrefix(organizationExternalId), null, null);
    if (orgGroups.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException(
          String.format(
              "Cannot add Okta user to nonexistent organization=%s", organizationExternalId));
    }
    Set<String> orgGroupNames =
        orgGroups.stream().map(g -> g.getProfile().getName()).collect(Collectors.toSet());
    groupNamesToAdd.stream()
        .filter(n -> !orgGroupNames.contains(n))
        .forEach(
            n -> {
              throw new IllegalGraphqlArgumentException(
                  String.format("Cannot add Okta user to nonexistent group=%s", n));
            });
    Set<String> groupIdsToAdd =
        orgGroups.stream()
            .filter(g -> groupNamesToAdd.contains(g.getProfile().getName()))
            .map(g -> g.getId())
            .collect(Collectors.toSet());

    UserBuilder.instance()
        .setProfileProperties(userProfileMap)
        .setGroups(groupIdsToAdd)
        .setActive(active)
        .buildAndCreate(_client);

    List<OrganizationRoleClaims> claims = _extractor.convertClaims(groupNamesToAdd);
    if (claims.size() != 1) {
      LOG.warn("User is in {} Okta organizations, not 1", claims.size());
      return Optional.empty();
    }
    return Optional.of(claims.get(0));
  }

  public Set<String> getAllUsersForOrganization(Organization org) {
    final String orgDefaultGroupName =
        generateRoleGroupName(org.getExternalId(), OrganizationRole.getDefault());
    final GroupList oktaGroupList =
        _client.listGroups(orgDefaultGroupName, FILTER_TYPE_EQ_OKTA_GROUP, null);

    Group orgDefaultOktaGroup =
        oktaGroupList.stream()
            .filter(g -> orgDefaultGroupName.equals(g.getProfile().getName()))
            .findFirst()
            .orElseThrow(
                () ->
                    new IllegalGraphqlArgumentException(
                        "Okta group not found for this organization"));

    return orgDefaultOktaGroup.listUsers().stream()
        .map(u -> u.getProfile().getEmail())
        .collect(Collectors.toUnmodifiableSet());
  }

  public Optional<OrganizationRoleClaims> updateUser(IdentityAttributes userIdentity) {

    UserList users = _client.listUsers(userIdentity.getUsername(), null, null, null, null);
    if (users.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException(
          "Cannot update Okta user with unrecognized username");
    }
    User user = users.single();
    updateUser(user, userIdentity);

    return getOrganizationRoleClaimsForUser(user);
  }

  private void updateUser(User user, IdentityAttributes userIdentity) {
    user.getProfile().setFirstName(userIdentity.getFirstName());
    user.getProfile().setMiddleName(userIdentity.getMiddleName());
    user.getProfile().setLastName(userIdentity.getLastName());
    // Is it our fault we don't accommodate honorific suffix? Or Okta's fault they
    // don't have regular suffix? You decide.
    user.getProfile().setHonorificSuffix(userIdentity.getSuffix());
    user.update();
  }

  public void reprovisionUser(IdentityAttributes userIdentity) {
    UserList users = _client.listUsers(userIdentity.getUsername(), null, null, null, null);
    if (users.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException(
          "Cannot reprovision Okta user with unrecognized username");
    }
    User user = users.single();
    UserStatus userStatus = user.getStatus();

    // any org user "deleted" through our api will be in SUSPENDED state
    if (userStatus != UserStatus.SUSPENDED) {
      throw new IllegalGraphqlArgumentException(
          "Cannot reprovision user in unsupported state: " + userStatus);
    }

    updateUser(user, userIdentity);

    // reset all MFA factors (this triggers an email to the user, which can be configured in Okta)
    user.resetFactors();

    // transitioning from SUSPENDED -> DEPROVISIONED -> ACTIVE will reset the user's password
    // and password reset question.  `.activate(true)` will send an activation email (just like
    // creating a new account).  This cannot be done with `.reactivate()` because `.reactivate()`
    // requires the user to be in PROVISIONED state
    user.deactivate();
    user.activate(true);
  }

  public Optional<OrganizationRoleClaims> updateUserPrivileges(
      String username, Organization org, Set<Facility> facilities, Set<OrganizationRole> roles) {
    UserList users = _client.listUsers(username, null, null, null, null);
    if (users.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException(
          "Cannot update role of Okta user with unrecognized username");
    }
    User user = users.single();

    String orgId = org.getExternalId();

    final String groupOrgPrefix = generateGroupOrgPrefix(orgId);
    final String groupOrgDefaultName = generateRoleGroupName(orgId, OrganizationRole.getDefault());

    // Map user's current Okta group memberships (Okta group name -> Okta Group).
    // The Okta group name is our friendly role and facility group names
    Map<String, Group> currentOrgGroupMapForUser =
        user.listGroups().stream()
            .filter(
                g ->
                    GroupType.OKTA_GROUP == g.getType()
                        && g.getProfile().getName().startsWith(groupOrgPrefix))
            .collect(Collectors.toMap(g -> g.getProfile().getName(), g -> g));

    if (!currentOrgGroupMapForUser.containsKey(groupOrgDefaultName)) {
      // The user is not a member of the default group for this organization.  If they happen
      // to be in any of this organization's groups, remove the user from those groups.
      currentOrgGroupMapForUser.values().forEach(g -> g.removeUser(user.getId()));
      throw new IllegalGraphqlArgumentException(
          "Cannot update privileges of Okta user in organization they do not belong to.");
    }

    Set<String> expectedOrgGroupNamesForUser = new HashSet<>();
    expectedOrgGroupNamesForUser.add(groupOrgDefaultName);
    expectedOrgGroupNamesForUser.addAll(
        roles.stream().map(r -> generateRoleGroupName(orgId, r)).collect(Collectors.toSet()));
    if (!PermissionHolder.grantsAllFacilityAccess(roles)) {
      expectedOrgGroupNamesForUser.addAll(
          facilities.stream()
              .map(f -> generateFacilityGroupName(orgId, f.getInternalId()))
              .collect(Collectors.toSet()));
    }

    // to remove...
    Set<String> groupNamesToRemove = new HashSet<>(currentOrgGroupMapForUser.keySet());
    groupNamesToRemove.removeIf(expectedOrgGroupNamesForUser::contains);

    // to add...
    Set<String> groupNamesToAdd = new HashSet<>(expectedOrgGroupNamesForUser);
    groupNamesToAdd.removeIf(currentOrgGroupMapForUser::containsKey);

    if (!groupNamesToRemove.isEmpty() || !groupNamesToAdd.isEmpty()) {
      Map<String, Group> fullOrgGroupMap =
          _client.listGroups(groupOrgPrefix, null, null).stream()
              .filter(g -> GroupType.OKTA_GROUP == g.getType())
              .collect(Collectors.toMap(g -> g.getProfile().getName(), Function.identity()));
      if (fullOrgGroupMap.size() == 0) {
        throw new IllegalGraphqlArgumentException(
            String.format("Cannot add Okta user to nonexistent organization=%s", orgId));
      }

      for (String groupName : groupNamesToRemove) {
        Group group = fullOrgGroupMap.get(groupName);
        LOG.info("Removing {} from Okta group: {}", username, group.getProfile().getName());
        group.removeUser(user.getId());
      }

      for (String groupName : groupNamesToAdd) {
        if (!fullOrgGroupMap.containsKey(groupName)) {
          throw new IllegalGraphqlArgumentException(
              String.format("Cannot add Okta user to nonexistent group=%s", groupName));
        }
        Group group = fullOrgGroupMap.get(groupName);
        LOG.info("Adding {} to Okta group: {}", username, group.getProfile().getName());
        user.addToGroup(group.getId());
      }
    }

    return getOrganizationRoleClaimsForUser(user);
  }

  public void resetUserPassword(String username) {
    System.out.println("BOOYAH in live reset password");
    LOG.info("BOOYAH in live resetting user password");
    UserList users = _client.listUsers(username, null, null, null, null);
    if (users.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException(
          "Cannot reset password for Okta user with unrecognized username");
    }
    User user = users.single();
    user.resetPassword(true);
  }

  public void setUserIsActive(String username, Boolean active) {
    UserList users = _client.listUsers(username, null, null, null, null);
    if (users.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException(
          "Cannot update active status of Okta user with unrecognized username");
    }
    User user = users.single();

    if (active && user.getStatus() == UserStatus.SUSPENDED) {
      user.unsuspend();
    } else if (!active && user.getStatus() != UserStatus.SUSPENDED) {
      user.suspend();
    }
  }

  public UserStatus getUserStatus(String username) {
    UserList users = _client.listUsers(username, null, null, null, null);
    if (users.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException(
          "Cannot retrieve Okta user's status with unrecognized username");
    }
    User user = users.single();
    return user.getStatus();
  }

  public void reactivateUser(String username) {
    UserList users = _client.listUsers(username, null, null, null, null);
    if (users.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException(
          "Cannot reactivate Okta user with unrecognized username");
    }
    User user = users.single();
    user.unsuspend();
  }

  /**
   * Iterates over all OrganizationRole's, creating new corresponding Okta groups for this
   * organization where they do not already exist. For those OrganizationRole's that are in
   * MIGRATION_DEST_ROLES and whose Okta groups are newly created, migrate all users from this org
   * to those new Okta groups, where the migrated users are sourced from all pre-existing Okta
   * groups for this organization. Separately, iterates over all facilities in this org, creating
   * new corresponding Okta groups where they do not already exist. Does not perform any migration
   * to these facility groups.
   */
  public void createOrganization(Organization org) {
    String name = org.getOrganizationName();
    String externalId = org.getExternalId();

    for (OrganizationRole role : OrganizationRole.values()) {
      String roleGroupName = generateRoleGroupName(externalId, role);
      String roleGroupDescription = generateRoleGroupDescription(name, role);
      Group g =
          GroupBuilder.instance()
              .setName(roleGroupName)
              .setDescription(roleGroupDescription)
              .buildAndCreate(_client);
      _app.createApplicationGroupAssignment(g.getId());

      LOG.info("Created Okta group={}", roleGroupName);
    }

    _app.update();
  }

  public void activateOrganization(Organization org) {
    String externalId = org.getExternalId();
    String roleGroupName = generateRoleGroupName(externalId, OrganizationRole.ADMIN);
    GroupList groups = _client.listGroups(roleGroupName, null, null);
    if (groups.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException("Cannot activate nonexistent Okta organization");
    }
    Group group = groups.single();
    UserList users = group.listUsers();
    for (User u : users) {
      // reactivates user and sends them an Okta email to reactivate their account
      if (u.getStatus() == UserStatus.PROVISIONED) {
        u.reactivate(true);
      } else if (u.getStatus() == UserStatus.STAGED) {
        u.activate(true);
      } else {
        throw new IllegalGraphqlArgumentException(
            "Cannot activate Okta organization whose users have status=" + u.getStatus().name());
      }
    }
  }

  public void createFacility(Facility facility) {
    // Only create the facility group if the facility's organization has already been created
    String orgExternalId = facility.getOrganization().getExternalId();
    GroupList orgGroups = _client.listGroups(generateGroupOrgPrefix(orgExternalId), null, null);
    if (orgGroups.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException(
          "Cannot create Okta group for facility="
              + facility.getFacilityName()
              + ": facility's org="
              + facility.getOrganization().getExternalId()
              + " has not yet been created in Okta");
    }

    String orgName = facility.getOrganization().getOrganizationName();
    String facilityGroupName = generateFacilityGroupName(orgExternalId, facility.getInternalId());
    Group g =
        GroupBuilder.instance()
            .setName(facilityGroupName)
            .setDescription(generateFacilityGroupDescription(orgName, facility.getFacilityName()))
            .buildAndCreate(_client);
    _app.createApplicationGroupAssignment(g.getId());

    LOG.info("Created Okta group={}", facilityGroupName);

    _app.update();
  }

  public void deleteFacility(Facility facility) {
    String orgExternalId = facility.getOrganization().getExternalId();
    String groupName = generateFacilityGroupName(orgExternalId, facility.getInternalId());
    GroupList groups = _client.listGroups(groupName, null, null);
    for (Group group : groups) {
      group.delete();
    }
  }

  public void deleteOrganization(Organization org) {
    String externalId = org.getExternalId();
    GroupList orgGroups = _client.listGroups(generateGroupOrgPrefix(externalId), null, null);
    for (Group group : orgGroups) {
      group.delete();
    }
  }

  // returns the external ID of the organization the specified user belongs to
  public Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(String username) {
    // When a site admin is using tenant data access, bypass okta and get org from the altered
    // authorities.  If the site admin is getting the claims for another site admin who also has
    // active tenant data access, the reflect what is in Okta, not the temporary claims.
    if (_tenantDataContextHolder.hasBeenPopulated()
        && username.equals(_tenantDataContextHolder.getUsername())) {
      return getOrganizationRoleClaimsFromAuthorities(_tenantDataContextHolder.getAuthorities());
    }

    UserList users = _client.listUsers(username, null, null, null, null);
    if (users.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException("Cannot get org external ID for nonexistent user");
    }
    User user = users.single();
    return getOrganizationRoleClaimsForUser(user);
  }

  private Optional<OrganizationRoleClaims> getOrganizationRoleClaimsFromAuthorities(
      Collection<String> authorities) {
    List<OrganizationRoleClaims> claims = _extractor.convertClaims(authorities);

    if (claims.size() != 1) {
      LOG.warn("User's Tenant Data Access has claims in {} organizations, not 1", claims.size());
      return Optional.empty();
    }
    return Optional.of(claims.get(0));
  }

  private Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(User user) {
    List<String> groupNames =
        user.listGroups().stream()
            .filter(g -> g.getType() == GroupType.OKTA_GROUP)
            .map(g -> g.getProfile().getName())
            .collect(Collectors.toList());
    List<OrganizationRoleClaims> claims = _extractor.convertClaims(groupNames);

    if (claims.size() != 1) {
      LOG.warn("User is in {} Okta organizations, not 1", claims.size());
      return Optional.empty();
    }
    return Optional.of(claims.get(0));
  }

  private String generateGroupOrgPrefix(String orgExternalId) {
    return String.format("%s%s", _rolePrefix, orgExternalId);
  }

  private String generateRoleGroupName(String orgExternalId, OrganizationRole role) {
    return String.format("%s%s%s", _rolePrefix, orgExternalId, generateRoleSuffix(role));
  }

  private String generateFacilityGroupName(String orgExternalId, UUID facilityId) {
    return String.format(
        "%s%s%s", _rolePrefix, orgExternalId, generateFacilitySuffix(facilityId.toString()));
  }

  private String generateRoleGroupDescription(String orgName, OrganizationRole role) {
    return String.format("%s - %ss", orgName, role.getDescription());
  }

  private String generateFacilityGroupDescription(String orgName, String facilityName) {
    return String.format("%s - Facility Access - %s", orgName, facilityName);
  }

  private String generateRoleSuffix(OrganizationRole role) {
    return ":" + role.name();
  }

  private String generateFacilitySuffix(String facilityId) {
    return ":" + OrganizationExtractor.FACILITY_ACCESS_MARKER + ":" + facilityId;
  }
}
