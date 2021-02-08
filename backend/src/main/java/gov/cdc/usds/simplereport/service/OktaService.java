package gov.cdc.usds.simplereport.service;

import java.util.List;
import java.util.Optional;

import gov.cdc.usds.simplereport.config.authorization.AuthorityBasedOrganizationRoles;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

/**
 * Created by jeremyzitomer-usds on 1/7/21
 * 
 * Handles all user/organization management in Okta
 */
public interface OktaService {

    public void createUser(IdentityAttributes userIdentity, String organizationExternalId);

    public void updateUser(String oldUsername, IdentityAttributes userIdentity);

    public List<String> getAllUsernamesForOrganization(String externalId, OrganizationRole role);

    public void createOrganization(String name, String externalId);

    public void deleteOrganization(String externalId);

    public Optional<AuthorityBasedOrganizationRoles> getOrganizationRolesForUser(String username);

}