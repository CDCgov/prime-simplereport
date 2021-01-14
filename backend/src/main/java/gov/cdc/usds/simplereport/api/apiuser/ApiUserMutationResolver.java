package gov.cdc.usds.simplereport.api.apiuser;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.model.DeviceTypeHolder;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;


/**
 * Created by jeremyzitomer-usds on 1/7/21
 */
@Component
public class ApiUserMutationResolver implements GraphQLMutationResolver {

    private final OrganizationService _os;
    private final ApiUserService _us;

    private static final Logger logger = LoggerFactory.getLogger(ApiUserMutationResolver.class);

    public ApiUserMutationResolver(OrganizationService os, ApiUserService us) {
        _os = os;
        _us = us;
    }

    public User addUser(
            String firstName,
            String middleName,
            String lastName,
            String suffix,
            String email,
            // may want to replace with an Organization object in the future
            String organizationExternalID
                ) {
        _us.assertEmailAvailable(email);
        ApiUser apiUser = _us.createUser(email, firstName, middleName, lastName, suffix, organizationExternalID);
        Organization org = _os.getOrganization(organizationExternalID);
        Boolean isAdmin = _us.isAdminUser(apiUser);
        return new User(apiUser, org, isAdmin);
    }

    public User updateUser(
            String Id,
            String firstName,
            String middleName,
            String lastName,
            String suffix,
            String newEmail,
            String oldEmail,
            // may want to replace with an Organization object in the future
            String organizationExternalID
                ) {
        // if no changes to email are made, email validation will happen inside _us.updateUser()
        if (!newEmail.equals(oldEmail)) {
            _us.assertEmailAvailable(newEmail);
        }
        ApiUser apiUser = _us.updateUser(Id, newEmail, oldEmail, firstName, middleName, lastName, suffix, organizationExternalID);
        Organization org = _os.getOrganization(organizationExternalID);
        Boolean isAdmin = _us.isAdminUser(apiUser);
        return new User(apiUser, org, isAdmin);
    }
}



