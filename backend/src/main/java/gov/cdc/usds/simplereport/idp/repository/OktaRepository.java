package gov.cdc.usds.simplereport.idp.repository;

import com.okta.sdk.resource.model.UserStatus;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Created by jeremyzitomer-usds on 1/7/21
 *
 * <p>Handles all user/organization management in Okta
 */
public interface OktaRepository {
  Integer OKTA_ORGS_LIMIT = 50;
  Integer OKTA_RATE_LIMIT_SLEEP_MS = 60000;

  default Integer getOktaOrgsLimit() {
    return OKTA_ORGS_LIMIT;
  }

  default Integer getOktaRateLimitSleepMs() {
    return OKTA_RATE_LIMIT_SLEEP_MS;
  }

  Optional<OrganizationRoleClaims> createUser(
      IdentityAttributes userIdentity,
      Organization org,
      Set<Facility> facilities,
      Set<OrganizationRole> roles,
      boolean active);

  Optional<OrganizationRoleClaims> updateUser(IdentityAttributes userIdentity);

  Optional<OrganizationRoleClaims> updateUserEmail(IdentityAttributes userIdentity, String email);

  void reprovisionUser(IdentityAttributes userIdentity);

  Optional<OrganizationRoleClaims> updateUserPrivileges(
      String username, Organization org, Set<Facility> facilities, Set<OrganizationRole> roles);

  List<String> updateUserPrivilegesAndGroupAccess(
      String username,
      Organization org,
      Set<Facility> facilities,
      OrganizationRole roles,
      boolean assignedToAllFacilities);

  void resetUserPassword(String username);

  void resetUserMfa(String username);

  void setUserIsActive(String username, boolean active);

  void reactivateUser(String username);

  void resendActivationEmail(String username);

  UserStatus getUserStatus(String username);

  Set<String> getAllUsersForOrganization(Organization org);

  Map<String, UserStatus> getAllUsersWithStatusForOrganization(Organization org);

  /**
   * @param org Organization being queried
   * @param pageNumber Starts at page number 0
   * @param pageSize Number of results per page
   * @return Map of usernames to the user status in Okta
   */
  Map<String, UserStatus> getPagedUsersWithStatusForOrganization(
      Organization org, int pageNumber, int pageSize);

  void createOrganization(Organization org);

  void activateOrganization(Organization org);

  String activateUser(String username);

  String activateOrganizationWithSingleUser(Organization org);

  List<String> fetchAdminUserEmail(Organization org);

  void createFacility(Facility facility);

  void deleteOrganization(Organization org);

  Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(String username);

  Integer getUsersCountInSingleFacility(Facility facility);

  Integer getUsersCountInOrganization(Organization org);

  PartialOktaUser findUser(String username);

  String getApplicationStatusForHealthCheck();
}
