package gov.cdc.usds.simplereport.api.apiuser;

import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.api.model.UserIdentity;
import gov.cdc.usds.simplereport.service.ApiUserService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
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

  public List<UserIdentity> getUsers() {
    return _userService.getUsersInCurrentOrg().stream()
        .map(UserIdentity::new)
        .collect(Collectors.toList());
  }

  public User getUser(UUID userId) {
    return new User(_userService.getUser(userId));
  }
}
