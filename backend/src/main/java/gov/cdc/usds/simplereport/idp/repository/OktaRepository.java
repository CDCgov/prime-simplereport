package gov.cdc.usds.simplereport.idp.repository;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import java.util.Optional;
import java.util.Set;

/**
 * Created by jeremyzitomer-usds on 1/7/21
 *
 * <p>Handles all user/organization management in Okta
 */
public interface OktaRepository {

  public Optional<OrganizationRoleClaims> createUser(
      IdentityAttributes userIdentity,
      Organization org,
      Set<Facility> facilities,
      Set<OrganizationRole> roles,
      boolean active);

  public Optional<OrganizationRoleClaims> updateUser(IdentityAttributes userIdentity);

  public void reprovisionUser(IdentityAttributes userIdentity);

  public Optional<OrganizationRoleClaims> updateUserPrivileges(
      String username, Organization org, Set<Facility> facilities, Set<OrganizationRole> roles);

  public void setUserIsActive(String username, Boolean active);

  public Set<String> getAllUsersForOrganization(Organization org);

  public void createOrganization(Organization org);

  public void activateOrganization(Organization org);

  public void createFacility(Facility facility);

  public void deleteOrganization(Organization org);

  public void deleteFacility(Facility facility);

  public Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(String username);
}
