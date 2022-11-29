package gov.cdc.usds.simplereport.api.apiuser;

import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
public class UserMutationResolver {

  private final ApiUserService _us;

  public UserMutationResolver(ApiUserService us) {
    _us = us;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  @MutationMapping
  public User addUser(
      @Argument PersonName name,
      @Argument String firstName,
      @Argument String middleName,
      @Argument String lastName,
      @Argument String suffix,
      @Argument String email,
      @Argument String organizationExternalId,
      @Argument Role role) {
    name = Translators.consolidateNameArguments(name, firstName, middleName, lastName, suffix);
    UserInfo user = _us.createUser(email, name, organizationExternalId, role);
    return new User(user);
  }

  @MutationMapping
  public User addUserToCurrentOrg(
      @Argument PersonName name,
      @Argument String firstName,
      @Argument String middleName,
      @Argument String lastName,
      @Argument String suffix,
      @Argument String email,
      @Argument Role role) {
    name = Translators.consolidateNameArguments(name, firstName, middleName, lastName, suffix);
    UserInfo user = _us.createUserInCurrentOrg(email, name, role);
    return new User(user);
  }

  @MutationMapping
  public ApiUser createApiUserNoOkta(
      @Argument PersonName name,
      @Argument String firstName,
      @Argument String middleName,
      @Argument String lastName,
      @Argument String suffix,
      @Argument String email) {
    name = Translators.consolidateNameArguments(name, firstName, middleName, lastName, suffix);
    return _us.createApiUserNoOkta(email, name);
  }

  @MutationMapping
  public User updateUser(
      @Argument UUID id,
      @Argument PersonName name,
      @Argument String firstName,
      @Argument String middleName,
      @Argument String lastName,
      @Argument String suffix) {
    name = Translators.consolidateNameArguments(name, firstName, middleName, lastName, suffix);
    UserInfo user = _us.updateUser(id, name);
    return new User(user);
  }

  @MutationMapping
  public User updateUserPrivileges(
      @Argument UUID id,
      @Argument boolean accessAllFacilities,
      @Argument List<UUID> facilities,
      @Argument Role role) {
    Set<UUID> facilitySet = facilities == null ? Set.of() : new HashSet<>(facilities);
    UserInfo user = _us.updateUserPrivileges(id, accessAllFacilities, facilitySet, role);
    return new User(user);
  }

  @MutationMapping
  public User updateUserEmail(@Argument UUID id, @Argument String email) {
    UserInfo user = _us.updateUserEmail(id, email);
    return new User(user);
  }

  @MutationMapping
  public User resetUserPassword(@Argument UUID id) {
    UserInfo user = _us.resetUserPassword(id);
    return new User(user);
  }

  @MutationMapping
  public User resetUserMfa(@Argument UUID id) {
    UserInfo user = _us.resetUserMfa(id);
    return new User(user);
  }

  @MutationMapping
  public User setUserIsDeleted(@Argument UUID id, @Argument boolean deleted) {
    UserInfo user = _us.setIsDeleted(id, deleted);
    return new User(user);
  }

  @MutationMapping
  public User reactivateUser(@Argument UUID id) {
    UserInfo user = _us.reactivateUser(id);
    return new User(user);
  }

  @MutationMapping
  public User resendActivationEmail(@Argument UUID id) {
    UserInfo user = _us.resendActivationEmail(id);
    return new User(user);
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  @MutationMapping
  public User setCurrentUserTenantDataAccess(
      @Argument String organizationExternalId, @Argument String justification) {
    UserInfo user =
        _us.setCurrentUserTenantDataAccess(
            Translators.parseStringNoTrim(organizationExternalId),
            Translators.parseString(justification));
    return new User(user);
  }
}
