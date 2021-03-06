package gov.cdc.usds.simplereport.idp.repository;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Created by jeremyzitomer-usds on 1/7/21
 *
 * <p>Handles all user/organization management in Okta
 */
public interface OktaRepository {

  public Optional<OrganizationRoleClaims> createUser(
      IdentityAttributes userIdentity, Organization org, Optional<Set<Facility>> facilities, OrganizationRole role);

  public Optional<OrganizationRoleClaims> updateUser(
      String oldUsername, IdentityAttributes userIdentity);

  public Optional<OrganizationRoleClaims> updateUserRole(
      String username, Organization org, OrganizationRole role);

  public void setUserIsActive(String username, Boolean active);

  public Map<String, OrganizationRoleClaims> getAllUsersForOrganization(Organization org);

  public void createOrganization(Organization org);

  public void createFacility(Facility facility);

  public void deleteOrganization(Organization org);

  public void deleteFacility(Facility facility);

  public Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(String username);
}
