package gov.cdc.usds.simplereport.idp.repository;

import java.util.List;
import java.util.Optional;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

/**
 * Created by jeremyzitomer-usds on 1/7/21
 * 
 * Handles all user/organization management in Okta
 */
public interface OktaRepository {

    public Optional<OrganizationRoleClaims> createUser(IdentityAttributes userIdentity, Organization org);

    public Optional<OrganizationRoleClaims> updateUser(String oldUsername, IdentityAttributes userIdentity);

    public OrganizationRole updateUserRole(String username, Organization org, OrganizationRole role);

    public void setUserIsActive(String username, Boolean active);

    public List<String> getAllUsernamesForOrganization(Organization org, OrganizationRole role);

    public void createOrganization(String name, String externalId);

    public void deleteOrganization(String externalId);

    public Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(String username);

}