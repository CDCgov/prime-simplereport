package gov.cdc.usds.simplereport.api.apiuser;

import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class UserMutationResolver implements GraphQLMutationResolver {

  private final ApiUserService _us;

  public UserMutationResolver(ApiUserService us) {
    _us = us;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public User addUser(
      PersonName name,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      String email,
      String organizationExternalID,
      Role role) {
    name = Translators.consolidateNameArguments(name, firstName, middleName, lastName, suffix);
    UserInfo user = _us.createUser(email, name, organizationExternalID, role);
    return new User(user);
  }

  public User addUserToCurrentOrg(
      PersonName name,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      String email,
      Role role) {
    name = Translators.consolidateNameArguments(name, firstName, middleName, lastName, suffix);
    UserInfo user = _us.createUserInCurrentOrg(email, name, role, true);
    return new User(user);
  }

  public User updateUser(
      UUID id,
      PersonName name,
      String firstName,
      String middleName,
      String lastName,
      String suffix) {
    name = Translators.consolidateNameArguments(name, firstName, middleName, lastName, suffix);
    UserInfo user = _us.updateUser(id, name);
    return new User(user);
  }

  // Making `facilities` an array instead of a Collection to avoid type erasure
  // of UUIDs to Strings since GraphQL ~does not actually make UUIDs UUIDs when you
  // pass them in~, and this would cause issues downstream.
  public User updateUserPrivileges(
      UUID id, boolean accessAllFacilities, UUID[] facilities, Role role) {
    Set<UUID> facilitySet =
        facilities == null ? Set.of() : new HashSet<>(Arrays.asList(facilities));
    UserInfo user = _us.updateUserPrivileges(id, accessAllFacilities, facilitySet, role);
    return new User(user);
  }

  public User setUserIsDeleted(UUID id, boolean deleted) {
    UserInfo user = _us.setIsDeleted(id, deleted);
    return new User(user);
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public User setCurrentUserTenantDataAccess(String organizationExternalID) {
    UserInfo user = _us.setCurrentUserTenantDataAccess(organizationExternalID);
    return new User(user);
  }
}
