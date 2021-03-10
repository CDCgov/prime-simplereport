package gov.cdc.usds.simplereport.api.apiuser;

import gov.cdc.usds.simplereport.api.model.ApiOrganizationRole;
import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.util.HashSet;
import java.util.List;
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
      ApiOrganizationRole role) {
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
      ApiOrganizationRole role) {
    UserInfo user =
        _us.createUserInCurrentOrg(email, firstName, middleName, lastName, suffix, role);
    return new User(user);
  }

  public User updateUser(
      UUID id, String firstName, String middleName, String lastName, String suffix, String email) {
    UserInfo user = _us.updateUser(id, email, firstName, middleName, lastName, suffix);
    return new User(user);
  }

  public ApiOrganizationRole updateUserRole(UUID id, ApiOrganizationRole role) {
    return _us.updateUserRole(id, role);
  }

  public User updateUserPrivileges(
      UUID id, boolean accessAllFacilities, List<String> facilities, ApiOrganizationRole role) {
    UserInfo user =
        _us.updateUserPrivileges(id, accessAllFacilities, new HashSet<>(facilities), role);
    return new User(user);
  }

  public User setUserIsDeleted(UUID id, boolean deleted) {
    UserInfo user = _us.setIsDeleted(id, deleted);
    return new User(user);
  }
}
