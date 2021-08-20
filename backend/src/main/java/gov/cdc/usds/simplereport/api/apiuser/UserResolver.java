package gov.cdc.usds.simplereport.api.apiuser;

import gov.cdc.usds.simplereport.api.model.ApiUserWithStatus;
import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.service.ApiUserService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** Resolver for the graphql User type */
@Component
public class UserResolver implements GraphQLQueryResolver {

  private ApiUserService _userService;

  public UserResolver(ApiUserService userService) {
    _userService = userService;
  }

  public User getWhoami() {
    return new User(_userService.getCurrentUserInfo());
  }

  // don't want to touch this, to make sure it's backwards-compatible
  public List<ApiUser> getUsers() {
    return _userService.getUsersInCurrentOrg();
  }

  // TODO: make a corresponding graphQL type and query for this
  // the query will probably have to be written on the frontend - not sure where the mapping is there
  public List<ApiUserWithStatus> getUsersAndStatus() {
    return _userService.getUsersAndStatusInCurrentOrg();
  }

  public User getUser(UUID userId) {
    return new User(_userService.getUser(userId));
  }
}
