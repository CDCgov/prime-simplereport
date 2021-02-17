package gov.cdc.usds.simplereport.api.apiuser;

import java.util.Optional;
import java.util.UUID;

import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.ApiUserService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;


/**
 * Created by jeremyzitomer-usds on 1/7/21
 */
@Component
public class ApiUserMutationResolver implements GraphQLMutationResolver {

    private final OrganizationService _os;
    private final ApiUserService _us;

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
            String organizationExternalID
                ) {
        ApiUser apiUser = _us.createUser(email, firstName, middleName, lastName, suffix, organizationExternalID);
        Optional<OrganizationRoles> orgRoles = _us.getOrganizationRolesForUser(apiUser.getInternalId());
        Boolean isAdmin = _us.isAdmin(apiUser);
        return new User(apiUser, orgRoles, isAdmin);
    }
    
    public User addUserToCurrentOrg(
            String firstName,
            String middleName,
            String lastName,
            String suffix,
            String email
                ) {
        ApiUser apiUser = _us.createUserInCurrentOrg(email, firstName, middleName, lastName, suffix);
        Optional<OrganizationRoles> orgRoles = _us.getOrganizationRolesForUser(apiUser.getInternalId());
        Boolean isAdmin = _us.isAdmin(apiUser);
        return new User(apiUser, orgRoles, isAdmin);
    }

    public User updateUser(
            UUID id,
            String firstName,
            String middleName,
            String lastName,
            String suffix,
            String email
                ) {
        ApiUser apiUser = _us.updateUser(id, email, firstName, middleName, lastName, suffix);
        Optional<OrganizationRoles> orgRoles = _us.getOrganizationRolesForUser(apiUser.getInternalId());
        Boolean isAdmin = _us.isAdmin(apiUser);
        return new User(apiUser, orgRoles, isAdmin);
    }

    public OrganizationRole updateUserRole(
            UUID id,
            OrganizationRole role
                ) {
        return _us.updateUserRole(id, role);
    }

    public User setUserIsDeleted(
            UUID id,
            Boolean deleted
                ) {
        ApiUser apiUser = _us.setIsDeleted(id, deleted);
        Optional<OrganizationRoles> orgRoles = Optional.empty();
        Boolean isAdmin = _us.isAdmin(apiUser);
        return new User(apiUser, orgRoles, isAdmin);
    }
}



