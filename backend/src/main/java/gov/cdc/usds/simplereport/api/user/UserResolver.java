package gov.cdc.usds.simplereport.api.user;

import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.service.UserService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class UserResolver implements GraphQLQueryResolver {

    private final UserService _us;

    public UserResolver(UserService us) {
        this._us = us;
    }

    User getUser() {
        return _us.getUser();
    }
}
