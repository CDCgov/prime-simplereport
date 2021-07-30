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

  Optional<OrganizationRoleClaims> createUser(
      IdentityAttributes userIdentity,
      Organization org,
      Set<Facility> facilities,
      Set<OrganizationRole> roles,
      boolean active);

  Optional<OrganizationRoleClaims> updateUser(IdentityAttributes userIdentity);

  void reprovisionUser(IdentityAttributes userIdentity);

  Optional<OrganizationRoleClaims> updateUserPrivileges(
      String username, Organization org, Set<Facility> facilities, Set<OrganizationRole> roles);

  void setUserIsActive(String username, Boolean active);

  Map<String, OktaUserDetail> getAllUsersWithDetailsForOrganization(Organization org);

  Set<String> getAllUsersForOrganization(Organization org);

  void createOrganization(Organization org);

  void activateOrganization(Organization org);

  void createFacility(Facility facility);

  void deleteOrganization(Organization org);

  void deleteFacility(Facility facility);

  Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(String username);
}
