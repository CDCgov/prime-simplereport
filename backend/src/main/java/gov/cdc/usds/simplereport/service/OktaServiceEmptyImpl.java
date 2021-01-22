package gov.cdc.usds.simplereport.service;

import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import gov.cdc.usds.simplereport.config.BeanProfiles;

import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

/**
 * Created by jeremyzitomer-usds on 1/7/21
 * 
 * Handles all user/organization management in Okta
 */
@Component
@Primary
@Profile(BeanProfiles.NO_OKTA_MGMT)
public class OktaServiceEmptyImpl implements OktaService {

    public OktaServiceEmptyImpl() {}

    public void createUser(IdentityAttributes userIdentity, String organizationExternalId) {}

    public void updateUser(String oldUsername, IdentityAttributes userIdentity) {}

    public void createOrganization(String name, String externalId) {
    }

    public void deleteOrganization(String externalId) {}

    // returns the external ID of the organization the specified user belongs to
    public String getOrganizationExternalIdForUser(String username) {
        return null;
    }
}