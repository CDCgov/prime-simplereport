package gov.cdc.usds.simplereport.idp.repository;

import com.okta.sdk.helper.ApiExceptionHelper;
import com.okta.sdk.resource.group.GroupBuilder;
import com.okta.sdk.resource.user.UserBuilder;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.model.errors.ConflictingUserException;
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
import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.openapitools.client.ApiException;
import org.openapitools.client.api.ApplicationApi;
import org.openapitools.client.api.ApplicationGroupsApi;
import org.openapitools.client.api.GroupApi;
import org.openapitools.client.api.UserApi;
import org.openapitools.client.model.Application;
import org.openapitools.client.model.Error;
import org.openapitools.client.model.ErrorErrorCausesInner;
import org.openapitools.client.model.Group;
import org.openapitools.client.model.GroupType;
import org.openapitools.client.model.UpdateUserRequest;
import org.openapitools.client.model.User;
import org.openapitools.client.model.UserProfile;
import org.openapitools.client.model.UserStatus;
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
@Slf4j
public class LiveOktaRepository implements OktaRepository {

  private static final String OKTA_GROUP_NOT_FOUND = "Okta group not found for this organization";

  private final String rolePrefix;
  private final Application app;
  private final OrganizationExtractor extractor;
  private final CurrentTenantDataAccessContextHolder tenantDataContextHolder;
  private final GroupApi groupApi;
  private final UserApi userApi;
  private final ApplicationGroupsApi applicationGroupsApi;

  public LiveOktaRepository(
      AuthorizationProperties authorizationProperties,
      @Value("${okta.oauth2.client-id}") String oktaOAuth2ClientId,
      OrganizationExtractor organizationExtractor,
      CurrentTenantDataAccessContextHolder tenantDataContextHolder,
      GroupApi groupApi,
      ApplicationApi applicationApi,
      UserApi userApi,
      ApplicationGroupsApi applicationGroupsApi) {
    this.rolePrefix = authorizationProperties.getRolePrefix();
    this.groupApi = groupApi;
    this.userApi = userApi;
    this.applicationGroupsApi = applicationGroupsApi;
    try {
      this.app = applicationApi.getApplication(oktaOAuth2ClientId, null);
    } catch (ApiException e) {
      throw new MisconfiguredApplicationException(
          "Cannot find Okta application with id=" + oktaOAuth2ClientId, e);
    }
    this.extractor = organizationExtractor;
    this.tenantDataContextHolder = tenantDataContextHolder;
  }

  @Override
  public Optional<OrganizationRoleClaims> createUser(
      IdentityAttributes userIdentity,
      Organization org,
      Set<Facility> facilities,
      Set<OrganizationRole> roles,
      boolean active) {
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

    // Search and q results need to be combined because search results have a delay of the newest
    // added groups. There is an open ticket for the okta sdk to investigate this issue
    // https://github.com/okta/okta-sdk-java/issues/750
    var searchResults =
        groupApi
            .listGroups(
                null,
                null,
                null,
                null,
                null,
                "profile.name sw \"" + generateGroupOrgPrefix(organizationExternalId) + "\"",
                null,
                null)
            .stream();
    var qResults =
        groupApi
            .listGroups(
                generateGroupOrgPrefix(organizationExternalId),
                null,
                null,
                null,
                null,
                null,
                null,
                null)
            .stream();
    var orgGroups = Stream.concat(searchResults, qResults).distinct().toList();
    throwErrorIfEmpty(
        orgGroups.stream(),
        String.format(
            "Cannot add Okta user to nonexistent organization=%s", organizationExternalId));
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
            .map(Group::getId)
            .collect(Collectors.toSet());
    validateRequiredFields(userIdentity);
    try {
      UserBuilder.instance()
          .setFirstName(userIdentity.getFirstName())
          .setMiddleName(userIdentity.getMiddleName())
          .setLastName(userIdentity.getLastName())
          .setHonorificSuffix(userIdentity.getSuffix())
          .setEmail(userIdentity.getUsername())
          .setLogin(userIdentity.getUsername())
          .setGroups(new ArrayList<>(groupIdsToAdd))
          .setActive(active)
          .buildAndCreate(userApi);
    } catch (ApiException e) {
      if (e.getMessage()
          .contains("An object with this field already exists in the current organization")) {
        throw new ConflictingUserException();
      } else {
        throw new IllegalGraphqlArgumentException(prettifyOktaError(e));
      }
    }

    List<OrganizationRoleClaims> claims = extractor.convertClaims(groupNamesToAdd);
    if (claims.size() != 1) {
      log.warn("User is in {} Okta organizations, not 1", claims.size());
      return Optional.empty();
    }
    return Optional.of(claims.get(0));
  }

  private static void validateRequiredFields(IdentityAttributes userIdentity) {
    if (StringUtils.isBlank(userIdentity.getLastName())) {
      throw new IllegalGraphqlArgumentException("Cannot create Okta user without last name");
    }
    if (StringUtils.isBlank(userIdentity.getUsername())) {
      throw new IllegalGraphqlArgumentException("Cannot create Okta user without username");
    }
  }

  @Override
  public Set<String> getAllUsersForOrganization(Organization org) {
    Group orgDefaultOktaGroup = getDefaultOktaGroup(org);
    var groupUsers = groupApi.listGroupUsers(orgDefaultOktaGroup.getId(), null, null);
    return groupUsers.stream()
        .map(u -> u.getProfile().getLogin())
        .collect(Collectors.toUnmodifiableSet());
  }

  @Override
  public Map<String, UserStatus> getAllUsersWithStatusForOrganization(Organization org) {
    Group orgDefaultOktaGroup = getDefaultOktaGroup(org);
    var groupUsers = groupApi.listGroupUsers(orgDefaultOktaGroup.getId(), null, null);
    return groupUsers.stream()
        .collect(Collectors.toMap(u -> u.getProfile().getLogin(), User::getStatus));
  }

  private Group getDefaultOktaGroup(Organization org) {
    final String orgDefaultGroupName =
        generateRoleGroupName(org.getExternalId(), OrganizationRole.getDefault());
    final var oktaGroupList =
        groupApi.listGroups(orgDefaultGroupName, null, null, null, null, null, null, null);

    return oktaGroupList.stream()
        .filter(g -> orgDefaultGroupName.equals(g.getProfile().getName()))
        .findFirst()
        .orElseThrow(() -> new IllegalGraphqlArgumentException(OKTA_GROUP_NOT_FOUND));
  }

  @Override
  public Optional<OrganizationRoleClaims> updateUser(IdentityAttributes userIdentity) {
    var users =
        userApi.listUsers(
            null,
            null,
            null,
            null,
            generateLoginSearchTerm(userIdentity.getUsername()),
            null,
            null);
    throwErrorIfEmpty(users.stream(), "Cannot update Okta user with unrecognized username");
    User user = users.get(0);
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
    var updateRequest = new UpdateUserRequest();
    updateRequest.setProfile(user.getProfile());
    userApi.updateUser(user.getId(), updateRequest, false);
  }

  @Override
  public Optional<OrganizationRoleClaims> updateUserEmail(
      IdentityAttributes userIdentity, String email) {
    var users =
        userApi.listUsers(
            null,
            null,
            null,
            null,
            generateLoginSearchTerm(userIdentity.getUsername()),
            null,
            null);
    throwErrorIfEmpty(
        users.stream(), "Cannot update email of Okta user with unrecognized username");
    User user = users.get(0);
    UserProfile profile = user.getProfile();
    profile.setLogin(email);
    profile.setEmail(email);
    user.setProfile(profile);
    var updateRequest = new UpdateUserRequest();
    updateRequest.setProfile(profile);
    try {
      userApi.updateUser(user.getId(), updateRequest, false);
    } catch (ApiException e) {
      if (e.getMessage()
          .contains("An object with this field already exists in the current organization")) {
        throw new ConflictingUserException();
      } else {
        throw new IllegalGraphqlArgumentException(prettifyOktaError(e));
      }
    }

    return getOrganizationRoleClaimsForUser(user);
  }

  @Override
  public void reprovisionUser(IdentityAttributes userIdentity) {
    var users =
        userApi.listUsers(
            null,
            null,
            null,
            null,
            generateLoginSearchTerm(userIdentity.getUsername()),
            null,
            null);
    throwErrorIfEmpty(users.stream(), "Cannot reprovision Okta user with unrecognized username");
    User user = users.get(0);
    UserStatus userStatus = user.getStatus();

    // any org user "deleted" through our api will be in SUSPENDED state
    if (userStatus != UserStatus.SUSPENDED) {
      throw new ConflictingUserException();
    }

    updateUser(user, userIdentity);
    userApi.resetFactors(user.getId());

    // transitioning from SUSPENDED -> DEPROVISIONED -> ACTIVE will reset the user's password
    // and password reset question.  `.activate(true)` will send an activation email (just like
    // creating a new account).  This cannot be done with `.reactivate()` because `.reactivate()`
    // requires the user to be in PROVISIONED state
    userApi.deactivateUser(user.getId(), false);
    userApi.activateUser(user.getId(), true);
  }

  @Override
  public Optional<OrganizationRoleClaims> updateUserPrivileges(
      String username, Organization org, Set<Facility> facilities, Set<OrganizationRole> roles) {
    User user =
        getUserOrThrowError(username, "Cannot update role of Okta user with unrecognized username");

    String orgId = org.getExternalId();

    final String groupOrgPrefix = generateGroupOrgPrefix(orgId);
    final String groupOrgDefaultName = generateRoleGroupName(orgId, OrganizationRole.getDefault());

    // Map user's current Okta group memberships (Okta group name -> Okta Group).
    // The Okta group name is our friendly role and facility group names
    Map<String, Group> currentOrgGroupMapForUser =
        userApi.listUserGroups(user.getId()).stream()
            .filter(
                g ->
                    GroupType.OKTA_GROUP == g.getType()
                        && g.getProfile().getName().startsWith(groupOrgPrefix))
            .collect(Collectors.toMap(g -> g.getProfile().getName(), g -> g));

    if (!currentOrgGroupMapForUser.containsKey(groupOrgDefaultName)) {
      // The user is not a member of the default group for this organization.  If they happen
      // to be in any of this organization's groups, remove the user from those groups.
      currentOrgGroupMapForUser
          .values()
          .forEach(g -> groupApi.unassignUserFromGroup(g.getId(), user.getId()));
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
          groupApi
              .listGroups(
                  null,
                  null,
                  null,
                  null,
                  null,
                  "profile.name sw \"" + groupOrgPrefix + "\"",
                  null,
                  null)
              .stream()
              .filter(g -> GroupType.OKTA_GROUP == g.getType())
              .collect(Collectors.toMap(g -> g.getProfile().getName(), Function.identity()));
      if (fullOrgGroupMap.size() == 0) {
        throw new IllegalGraphqlArgumentException(
            String.format("Cannot add Okta user to nonexistent organization=%s", orgId));
      }

      for (String groupName : groupNamesToRemove) {
        Group group = fullOrgGroupMap.get(groupName);
        log.info("Removing {} from Okta group: {}", username, group.getProfile().getName());
        groupApi.unassignUserFromGroup(group.getId(), user.getId());
      }

      for (String groupName : groupNamesToAdd) {
        if (!fullOrgGroupMap.containsKey(groupName)) {
          throw new IllegalGraphqlArgumentException(
              String.format("Cannot add Okta user to nonexistent group=%s", groupName));
        }
        Group group = fullOrgGroupMap.get(groupName);
        log.info("Adding {} to Okta group: {}", username, group.getProfile().getName());
        groupApi.assignUserToGroup(group.getId(), user.getId());
      }
    }

    return getOrganizationRoleClaimsForUser(user);
  }

  @Override
  public void resetUserPassword(String username) {
    var users =
        userApi.listUsers(null, null, null, null, generateLoginSearchTerm(username), null, null);
    throwErrorIfEmpty(
        users.stream(), "Cannot reset password for Okta user with unrecognized username");
    User user = users.get(0);
    userApi.generateResetPasswordToken(user.getId(), true, false);
  }

  @Override
  public void resetUserMfa(String username) {
    var users =
        userApi.listUsers(null, null, null, null, generateLoginSearchTerm(username), null, null);
    throwErrorIfEmpty(users.stream(), "Cannot reset MFA for Okta user with unrecognized username");
    User user = users.get(0);
    userApi.resetFactors(user.getId());
  }

  @Override
  public void setUserIsActive(String username, boolean active) {
    var users =
        userApi.listUsers(null, null, null, null, generateLoginSearchTerm(username), null, null);
    throwErrorIfEmpty(
        users.stream(), "Cannot update active status of Okta user with unrecognized username");
    User user = users.get(0);

    if (active && user.getStatus() == UserStatus.SUSPENDED) {
      userApi.unsuspendUser(user.getId());
    } else if (!active && user.getStatus() != UserStatus.SUSPENDED) {
      userApi.suspendUser(user.getId());
    }
  }

  @Override
  public UserStatus getUserStatus(String username) {
    return getUserOrThrowError(
            username, "Cannot retrieve Okta user's status with unrecognized username")
        .getStatus();
  }

  @Override
  public void reactivateUser(String username) {
    var users =
        userApi.listUsers(null, null, null, null, generateLoginSearchTerm(username), null, null);
    throwErrorIfEmpty(users.stream(), "Cannot reactivate Okta user with unrecognized username");
    User user = users.get(0);
    userApi.unsuspendUser(user.getId());
  }

  @Override
  public void resendActivationEmail(String username) {
    var users =
        userApi.listUsers(null, null, null, null, generateLoginSearchTerm(username), null, null);
    throwErrorIfEmpty(users.stream(), "Cannot reactivate Okta user with unrecognized username");
    User user = users.get(0);
    if (user.getStatus() == UserStatus.PROVISIONED) {
      userApi.reactivateUser(user.getId(), true);
    } else if (user.getStatus() == UserStatus.STAGED) {
      userApi.activateUser(user.getId(), true);
    } else {
      throw new IllegalGraphqlArgumentException(
          "Cannot reactivate user with status: " + user.getStatus());
    }
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
  @Override
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
              .buildAndCreate(groupApi);
      applicationGroupsApi.assignGroupToApplication(app.getId(), g.getId(), null);

      log.info("Created Okta group={}", roleGroupName);
    }
  }

  private List<User> getOrgAdminUsers(Organization org) {
    String externalId = org.getExternalId();
    String roleGroupName = generateRoleGroupName(externalId, OrganizationRole.ADMIN);
    var groups = groupApi.listGroups(roleGroupName, null, null, null, null, null, null, null);
    throwErrorIfEmpty(groups.stream(), "Cannot activate nonexistent Okta organization");
    Group group = groups.get(0);
    return groupApi.listGroupUsers(group.getId(), null, null);
  }

  private String activateUser(User user) {
    if (user.getStatus() == UserStatus.PROVISIONED) {
      // reactivates user and sends them an Okta email to reactivate their account
      return userApi.reactivateUser(user.getId(), true).getActivationToken();
    } else if (user.getStatus() == UserStatus.STAGED) {
      return userApi.activateUser(user.getId(), true).getActivationToken();
    } else {
      throw new IllegalGraphqlArgumentException(
          "Cannot activate Okta organization whose users have status=" + user.getStatus().name());
    }
  }

  @Override
  public void activateOrganization(Organization org) {
    var users = getOrgAdminUsers(org);
    for (User u : users) {
      activateUser(u);
    }
  }

  @Override
  public String activateOrganizationWithSingleUser(Organization org) {
    User user = getOrgAdminUsers(org).get(0);
    return activateUser(user);
  }

  @Override
  public List<String> fetchAdminUserEmail(Organization org) {
    var admins = getOrgAdminUsers(org);
    return admins.stream().map(u -> u.getProfile().getLogin()).toList();
  }

  @Override
  public void createFacility(Facility facility) {
    // Only create the facility group if the facility's organization has already been created
    String orgExternalId = facility.getOrganization().getExternalId();
    var orgGroups =
        groupApi.listGroups(
            generateGroupOrgPrefix(orgExternalId), null, null, null, null, null, null, null);
    throwErrorIfEmpty(
        orgGroups.stream(),
        String.format(
            "Cannot create Okta group for facility=%s: facility's org=%s, has not yet been created in Okta",
            facility.getFacilityName(), facility.getOrganization().getExternalId()));

    String orgName = facility.getOrganization().getOrganizationName();
    String facilityGroupName = generateFacilityGroupName(orgExternalId, facility.getInternalId());
    Group g =
        GroupBuilder.instance()
            .setName(facilityGroupName)
            .setDescription(generateFacilityGroupDescription(orgName, facility.getFacilityName()))
            .buildAndCreate(groupApi);
    applicationGroupsApi.assignGroupToApplication(app.getId(), g.getId(), null);

    log.info("Created Okta group={}", facilityGroupName);
  }

  public void deleteFacility(Facility facility) {
    String orgExternalId = facility.getOrganization().getExternalId();
    String groupName = generateFacilityGroupName(orgExternalId, facility.getInternalId());
    var groups = groupApi.listGroups(groupName, null, null, null, null, null, null, null);
    for (Group group : groups) {
      groupApi.deleteGroup(group.getId());
    }
  }

  @Override
  public void deleteOrganization(Organization org) {
    String externalId = org.getExternalId();
    var orgGroups =
        groupApi.listGroups(
            generateGroupOrgPrefix(externalId), null, null, null, null, null, null, null);
    for (Group group : orgGroups) {
      groupApi.deleteGroup(group.getId());
    }
  }

  // returns the external ID of the organization the specified user belongs to
  @Override
  public Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(String username) {
    // When a site admin is using tenant data access, bypass okta and get org from the altered
    // authorities.  If the site admin is getting the claims for another site admin who also has
    // active tenant data access, then reflect what is in Okta, not the temporary claims.
    if (tenantDataContextHolder.hasBeenPopulated()
        && username.equals(tenantDataContextHolder.getUsername())) {
      return getOrganizationRoleClaimsFromAuthorities(tenantDataContextHolder.getAuthorities());
    }

    return getOrganizationRoleClaimsForUser(
        getUserOrThrowError(username, "Cannot get org external ID for nonexistent user"));
  }

  private Optional<OrganizationRoleClaims> getOrganizationRoleClaimsFromAuthorities(
      Collection<String> authorities) {
    List<OrganizationRoleClaims> claims = extractor.convertClaims(authorities);

    if (claims.size() != 1) {
      log.warn("User's Tenant Data Access has claims in {} organizations, not 1", claims.size());
      return Optional.empty();
    }
    return Optional.of(claims.get(0));
  }

  private Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(User user) {
    List<String> groupNames =
        userApi.listUserGroups(user.getId()).stream()
            .filter(g -> g.getType() == GroupType.OKTA_GROUP)
            .map(g -> g.getProfile().getName())
            .toList();
    List<OrganizationRoleClaims> claims = extractor.convertClaims(groupNames);

    if (claims.size() != 1) {
      log.warn("User is in {} Okta organizations, not 1", claims.size());
      return Optional.empty();
    }
    return Optional.of(claims.get(0));
  }

  private String generateGroupOrgPrefix(String orgExternalId) {
    return String.format("%s%s", rolePrefix, orgExternalId);
  }

  private String generateRoleGroupName(String orgExternalId, OrganizationRole role) {
    return String.format("%s%s%s", rolePrefix, orgExternalId, generateRoleSuffix(role));
  }

  private String generateFacilityGroupName(String orgExternalId, UUID facilityId) {
    return String.format(
        "%s%s%s", rolePrefix, orgExternalId, generateFacilitySuffix(facilityId.toString()));
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

  private String generateLoginSearchTerm(String username) {
    return "profile.login eq \"" + username + "\"";
  }

  private void throwErrorIfEmpty(Stream<?> stream, String errorMessage) {
    if (stream.findAny().isEmpty()) {
      throw new IllegalGraphqlArgumentException(errorMessage);
    }
  }

  private User getUserOrThrowError(String username, String errorMessage) {
    var searchUsersStream =
        userApi
            .listUsers(null, null, null, null, generateLoginSearchTerm(username), null, null)
            .stream();
    var user = searchUsersStream.findFirst();
    if (user.isEmpty()) {
      var qUsersStream = userApi.listUsers(username, null, null, null, null, null, null).stream();
      user = qUsersStream.filter(u -> u.getProfile().getLogin().equals(username)).findFirst();
    }
    return user.orElseThrow(() -> new IllegalGraphqlArgumentException(errorMessage));
  }

  private String prettifyOktaError(ApiException e) {
    var errorMessage = "Code: " + e.getCode() + "; Message: " + e.getMessage();
    if (e.getResponseBody() != null) {
      Error error = ApiExceptionHelper.getError(e);
      if (error != null) {
        errorMessage =
            "Okta Error: " + error.getErrorCode() + ", Error summary: " + error.getErrorSummary();
        if (error.getErrorCauses() != null) {
          errorMessage +=
              ", Error Cause(s): "
                  + error.getErrorCauses().stream()
                      .map(ErrorErrorCausesInner::getErrorSummary)
                      .collect(Collectors.joining(", "));
        }
      }
    }
    return errorMessage;
  }
}
