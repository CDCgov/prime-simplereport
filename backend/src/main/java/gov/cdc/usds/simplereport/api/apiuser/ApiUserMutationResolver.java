package gov.cdc.usds.simplereport.api.apiuser;

import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** Created by jeremyzitomer-usds on 1/7/21 */
@Component
public class ApiUserMutationResolver implements GraphQLMutationResolver {

  private final ApiUserService _us;

  public ApiUserMutationResolver(ApiUserService us) {
    _us = us;
  }

  public User addUser(
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      String email,
      String organizationExternalID,
      Role role) {
    UserInfo user =
        _us.createUser(
            email, firstName, middleName, lastName, suffix, organizationExternalID, role);
    return new User(user);
  }

  public User addUserToCurrentOrg(
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      String email,
      Role role) {
    UserInfo user =
        _us.createUserInCurrentOrg(email, firstName, middleName, lastName, suffix, role);
    return new User(user);
  }

  public User updateUser(
      UUID id, String firstName, String middleName, String lastName, String suffix, String email) {
    UserInfo user = _us.updateUser(id, email, firstName, middleName, lastName, suffix);
    return new User(user);
  }

  public Role updateUserRole(UUID id, Role role) {
    return _us.updateUserRole(id, role);
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
}
