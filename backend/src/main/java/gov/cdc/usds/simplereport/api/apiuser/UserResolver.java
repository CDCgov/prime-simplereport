package gov.cdc.usds.simplereport.api.apiuser;

import gov.cdc.usds.simplereport.api.model.ApiUserWithStatus;
import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.service.ApiUserService;
import java.util.List;
import java.util.UUID;
import org.apache.commons.lang3.StringUtils;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

/** Resolver for the graphql User type */
@Controller
public class UserResolver {

  private ApiUserService _userService;

  public UserResolver(ApiUserService userService) {
    _userService = userService;
  }

  @QueryMapping
  public User whoami() {
    return new User(_userService.getCurrentUserInfo());
  }

  @QueryMapping
  public List<ApiUser> users() {
    return _userService.getUsersInCurrentOrg();
  }

  @QueryMapping
  public List<ApiUserWithStatus> usersWithStatus() {
    return _userService.getUsersAndStatusInCurrentOrg();
  }

  @QueryMapping
  public User user(@Argument UUID id, @Argument String email) {

    if (!StringUtils.isBlank(email)) {
      try {
        return new User(_userService.getUserByLoginEmail(email));
      } catch (NonexistentUserException e) {
        return null;
      }
    }

    return new User(_userService.getUser(id));
  }

  @QueryMapping
  public User userByLoginEmail(@Argument String loginEmail) {
    try {
      return new User(_userService.getUserByLoginEmail(loginEmail));
    } catch (NonexistentUserException e) {
      return null;
    }
  }
}
