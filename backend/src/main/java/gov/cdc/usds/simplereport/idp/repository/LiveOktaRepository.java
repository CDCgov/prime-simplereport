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
import com.okta.sdk.resource.group.rule.GroupRule;
import com.okta.sdk.resource.group.rule.GroupRuleBuilder;
import com.okta.sdk.resource.user.User;
import com.okta.sdk.resource.user.UserBuilder;
import com.okta.sdk.resource.user.UserList;
import com.okta.sdk.resource.user.UserStatus;
import com.okta.spring.boot.sdk.config.OktaClientProperties;
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
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

  private String _rolePrefix;
  private Client _client;
  private Application _app;
  private OrganizationExtractor _extractor;

  public LiveOktaRepository(
      AuthorizationProperties authorizationProperties,
      OktaClientProperties oktaClientProperties,
      @Value("${okta.oauth2.client-id}") String oktaOAuth2ClientId,
      OrganizationExtractor organizationExtractor) {
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
  }

  public Optional<OrganizationRoleClaims> createUser(
      IdentityAttributes userIdentity,
      Organization org,
      Set<Facility> facilities,
      Set<OrganizationRole> roles) {
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
        .buildAndCreate(_client);

    List<OrganizationRoleClaims> claims = _extractor.convertClaims(groupNamesToAdd);
    if (claims.size() != 1) {
      LOG.warn("User is in {} Okta organizations, not 1", claims.size());
      return Optional.empty();
    }
    return Optional.of(claims.get(0));
  }

  public Map<String, OrganizationRoleClaims> getAllUsersForOrganization(Organization org) {

    GroupList orgGroups =
        _client.listGroups(generateGroupOrgPrefix(org.getExternalId()), null, null);
    if (orgGroups.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException(
          "Cannot get Okta users for org=" + org.getExternalId() + ": Okta groups are nonexistent");
    }

    // Create a map from each user to their Okta groups...
    Map<String, Set<String>> usersToGroupNames = new HashMap<>();
    orgGroups.forEach(
        g -> {
          String groupName = g.getProfile().getName();
          g.listUsers()
              .forEach(
                  u -> {
                    String username = u.getProfile().getEmail();
                    if (!usersToGroupNames.containsKey(username)) {
                      usersToGroupNames.put(username, new HashSet<>());
                    }
                    usersToGroupNames.get(username).add(groupName);
                  });
        });

    // ...then convert each user's relevant Okta groups to an OrganizationRoleClaims object
    return usersToGroupNames.entrySet().stream()
        .collect(
            Collectors.toMap(e -> e.getKey(), e -> _extractor.convertClaims(e.getValue()).get(0)));
  }

  public Optional<OrganizationRoleClaims> updateUser(
      String oldUsername, IdentityAttributes userIdentity) {

    UserList users = _client.listUsers(oldUsername, null, null, null, null);
    if (users.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException(
          "Cannot update Okta user with unrecognized username");
    }
    User user = users.single();
    user.getProfile().setFirstName(userIdentity.getFirstName());
    user.getProfile().setMiddleName(userIdentity.getMiddleName());
    user.getProfile().setLastName(userIdentity.getLastName());
    // Is it our fault we don't accommodate honorific suffix? Or Okta's fault they
    // don't have regular suffix? You decide.
    user.getProfile().setHonorificSuffix(userIdentity.getSuffix());
    // We assume login == email
    user.getProfile().setEmail(userIdentity.getUsername());
    user.getProfile().setLogin(userIdentity.getUsername());
    user.update();

    return getOrganizationRoleClaimsForUser(user);
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
    boolean userInOrg = false;
    // Remove user from old groups
    for (Group g : user.listGroups()) {
      if (g.getType() == GroupType.OKTA_GROUP
          && g.getProfile().getName().startsWith(generateGroupOrgPrefix(orgId))) {
        userInOrg = true;
        // do not remove user from org's default group
        if (!g.getProfile()
            .getName()
            .equals(generateRoleGroupName(orgId, OrganizationRole.getDefault()))) {
          g.removeUser(user.getId());
        }
      }
    }
    if (!userInOrg) {
      throw new IllegalGraphqlArgumentException(
          "Cannot update privileges of Okta user in organization they do not belong to.");
    }

    // Add user to new groups
    Set<String> groupNamesToAdd = new HashSet<>();
    groupNamesToAdd.addAll(
        roles.stream()
            .filter(r -> r != OrganizationRole.getDefault())
            .map(r -> generateRoleGroupName(orgId, r))
            .collect(Collectors.toSet()));
    groupNamesToAdd.addAll(
        facilities.stream()
            // use an empty set of facilities if user can access all facilities anyway
            .filter(f -> !PermissionHolder.grantsAllFacilityAccess(roles))
            .map(f -> generateFacilityGroupName(orgId, f.getInternalId()))
            .collect(Collectors.toSet()));

    GroupList orgGroups = _client.listGroups(generateGroupOrgPrefix(orgId), null, null);
    if (orgGroups.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException(
          String.format("Cannot add Okta user to nonexistent organization=%s", orgId));
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
    orgGroups.stream()
        .filter(g -> groupNamesToAdd.contains(g.getProfile().getName()))
        .forEach(g -> user.addToGroup(g.getId()));

    return getOrganizationRoleClaimsForUser(user);
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

  public void createOrganization(Organization org, Collection<Facility> facilities, boolean migration) {
    String name = org.getOrganizationName();
    String externalId = org.getExternalId();

    // After the first migration, the migration code below will amount to a no-op,
    // until we change the next line to new OrganizationRole's
    Set<OrganizationRole> migrationDestRoles = Set.of(OrganizationRole.MEMBER, OrganizationRole.ALL_FACILITIES);
    List<String> migrationDestGroupIds = new ArrayList<>();
    List<String> migrationDestGroupNames = new ArrayList<>();
    List<String> migrationSourceGroupNames = new ArrayList<>();

    for (OrganizationRole role : OrganizationRole.values()) {
      String roleGroupName = generateRoleGroupName(externalId, role);
      String roleGroupDescription = generateRoleGroupDescription(name, role);
      try {
        Group g =
        GroupBuilder.instance()
            .setName(roleGroupName)
            .setDescription(roleGroupDescription)
            .buildAndCreate(_client);
        _app.createApplicationGroupAssignment(g.getId());

        if (migration) {
          LOG.info("Created Okta group={} via migration", roleGroupName);
        }
        
        if (migration && migrationDestRoles.contains(role)) {
          migrationDestGroupIds.add(g.getId());
          migrationDestGroupNames.add(roleGroupName);
        }
      } catch (ResourceException e) {
        if (migration) {
          migrationSourceGroupNames.add(roleGroupName);
        } else {
          // ignore attempts to create groups that already exist if this is in migration mode
          throw e;
        }
      }
    }

    for (Facility facility : facilities) {
      String facilityGroupName = generateFacilityGroupName(externalId, facility.getInternalId());
      String facilityGroupDescription = generateFacilityGroupDescription(name, facility.getFacilityName());
      try {
        Group g =
            GroupBuilder.instance()
                .setName(facilityGroupName)
                .setDescription(facilityGroupDescription)
                .buildAndCreate(_client);
        _app.createApplicationGroupAssignment(g.getId());

        if (migration) {
          LOG.info("Created Okta group={} via migration", facilityGroupName);
        }

      } catch (ResourceException e) {
        if (migration) {
          migrationSourceGroupNames.add(facilityGroupName);
        } else {
          // ignore attempts to create groups that already exist if this is in migration mode
          throw e;
        }
      }
    }

    if (migration && !migrationSourceGroupNames.isEmpty() && !migrationDestGroupIds.isEmpty()) {
      String ruleName = generateMigrationGroupRuleName(externalId, migrationDestRoles);
      String ruleExpression = generateMigrationGroupRuleExpression(migrationSourceGroupNames);
      try {
        // https://developer.okta.com/docs/reference/api/groups/#group-rule-operations
        GroupRule rule = GroupRuleBuilder.instance()
            .setType("group_rule")
            .setName(ruleName)
            .setGroupRuleExpressionType("urn:okta:expression:1.0")
            .setGroupRuleExpressionValue(ruleExpression)
            .setAssignUserToGroups(migrationDestGroupIds)
            .buildAndCreate(_client);
        rule.activate();

        LOG.info("Migrated users from Okta source_groups={} to destination_groups={}", 
                migrationSourceGroupNames,
                migrationDestGroupNames);
      } catch (ResourceException e) {
        LOG.error("Error migrating users from Okta source_groups={} to destination_groups={}: " +
                  "check if conflicting group_rule={} already exists. " +
                  "Did you delete groups without deleting their relevant group rules?", 
                  migrationSourceGroupNames,
                  migrationDestGroupNames,
                  ruleName);
      }
    }

    _app.update();
  }

  public void createOrganization(Organization org) {
    createOrganization(org, Set.of(), false);
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
    Group g =
        GroupBuilder.instance()
            .setName(generateFacilityGroupName(orgExternalId, facility.getInternalId()))
            .setDescription(generateFacilityGroupDescription(orgName, facility.getFacilityName()))
            .buildAndCreate(_client);
    _app.createApplicationGroupAssignment(g.getId());

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

    UserList users = _client.listUsers(username, null, null, null, null);
    if (users.stream().count() == 0) {
      throw new IllegalGraphqlArgumentException("Cannot get org external ID for nonexistent user");
    }
    User user = users.single();
    if (user.getStatus() == UserStatus.SUSPENDED) {
      throw new IllegalGraphqlArgumentException("Cannot get org external ID for suspended user");
    }

    return getOrganizationRoleClaimsForUser(user);
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
    return ":FACILITY_ACCESS:" + facilityId;
  }

  private String generateMigrationGroupRuleName(String orgExternalId, Collection<OrganizationRole> roles) {
    return generateGroupOrgPrefix(orgExternalId) + " " + roles.toString();
  }

  private String generateMigrationGroupRuleExpression(Collection<String> groupNames) {
    return String.join(" OR ",
                       groupNames.stream()
                          .map(i -> "isMemberOfGroupName(\""+i+"\")")
                          .collect(Collectors.toList()));
  }
}
