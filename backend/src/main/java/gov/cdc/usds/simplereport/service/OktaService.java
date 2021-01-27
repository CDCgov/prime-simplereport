package gov.cdc.usds.simplereport.service;

import java.util.List;

import org.springframework.stereotype.Service;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

/**
 * Created by jeremyzitomer-usds on 1/7/21
 * 
 * Handles all user/organization management in Okta
 */
@Service
public interface OktaService {

    public void createUser(IdentityAttributes userIdentity, String organizationExternalId);

    public void updateUser(String oldUsername, IdentityAttributes userIdentity);

    public List<String> getAllUsernamesForOrganization(String externalId, OrganizationRole role);

    public void createOrganization(String name, String externalId);

    public void deleteOrganization(String externalId);

    // returns the external ID of the organization the specified user belongs to
    public String getOrganizationExternalIdForUser(String username);

}