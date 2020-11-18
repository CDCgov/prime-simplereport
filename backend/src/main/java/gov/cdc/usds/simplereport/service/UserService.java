package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.User;
import org.springframework.stereotype.Service;

/**
 * Created by nickrobison on 11/17/20
 *
 * Right now, this just returns the demo user, all the time
 */
@Service
public class UserService {

    private final User _user;

    public UserService(OrganizationService os) {
        _user = new User(os.getCurrentOrganization());
    }

    public User getUser() {
        return _user;
    }
}
