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

    void createOrganization(Organization org);

    void activateOrganization(Organization org);

    String activateOrganizationWithSingleUser(Organization org);

    List<String> fetchAdminUserEmail(Organization org);

    void createFacility(Facility facility);

    void deleteOrganization(Organization org);

    void deleteFacility(Facility facility);

    Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(String username);

    Integer getUsersInSingleFacility(Facility facility);

    PartialOktaUser findUser(String username);

    String getApplicationStatusForHealthCheck();
}
