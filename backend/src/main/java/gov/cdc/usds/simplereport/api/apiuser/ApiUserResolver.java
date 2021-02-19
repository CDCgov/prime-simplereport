package gov.cdc.usds.simplereport.api.apiuser;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.User;

import gov.cdc.usds.simplereport.service.ApiUserService;
import graphql.kickstart.tools.GraphQLQueryResolver;

@Component
public class ApiUserResolver implements GraphQLQueryResolver  {

	private ApiUserService _userService;

	public ApiUserResolver(ApiUserService userService) {
		_userService = userService;
	}

	public User getWhoami() {
		return new User(_userService.getCurrentUserInfo());
	}

	public List<User> getUsers() {
		return _userService.getUsersInCurrentOrg().stream()
				.map(u -> new User(u)).collect(Collectors.toList());
	}
}
