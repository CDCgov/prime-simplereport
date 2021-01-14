package gov.cdc.usds.simplereport.api.apiuser;

import org.springframework.stereotype.Service;

import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.db.model.Organization;
import graphql.kickstart.tools.GraphQLResolver;

/**
 * Created by jeremyzitomer-usds on 1/7/21
 */
@Service
public class ApiUserDataResolver implements GraphQLResolver<User> {

	public String getId(User u) {
		return u.getId();
	}

	public String getFirstName(User u) {
		return u.getFirstName();
	}

	public String getMiddleName(User u) {
		return u.getMiddleName();
	}

	public String getLastName(User u) {
		return u.getLastName();
	}

	public String getSuffix(User u) {
		return u.getSuffix();
	}

	public String getEmail(User u) {
		return u.getEmail();
	}

	public Organization getOrganization(User u) {
		return u.getOrganization();
	}
}
