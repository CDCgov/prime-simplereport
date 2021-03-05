package gov.cdc.usds.simplereport.api.apiuser;

import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import graphql.kickstart.tools.GraphQLMutationResolver;
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
      OrganizationRole role) {
    // For backward compatibility
    if (role == null) {
      role = OrganizationRole.getDefault();
    }
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
      OrganizationRole role) {
    if (role == null) {
      role = OrganizationRole.getDefault();
    }
    UserInfo user =
        _us.createUserInCurrentOrg(email, firstName, middleName, lastName, suffix, role);
    return new User(user);
  }

  public User updateUser(
      UUID id, String firstName, String middleName, String lastName, String suffix, String email) {
    UserInfo user = _us.updateUser(id, email, firstName, middleName, lastName, suffix);
    return new User(user);
  }

  public OrganizationRole updateUserRole(UUID id, OrganizationRole role) {
    return _us.updateUserRole(id, role);
  }

  public User setUserIsDeleted(UUID id, boolean deleted) {
    UserInfo user = _us.setIsDeleted(id, deleted);
    return new User(user);
  }
}
