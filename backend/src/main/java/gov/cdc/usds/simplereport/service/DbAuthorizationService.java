package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class DbAuthorizationService {
  private final ApiUserRepository _userRepo;

  /**
   * Fetches a list of ApiUsers that belong to an Organization sorted by last name, first name, and
   * middle name
   *
   * @param org - Organization
   * @return List of ApiUsers that belong to the org
   */
  @AuthorizationConfiguration.RequirePermissionManageUsers
  public List<ApiUser> getUsersInOrganization(Organization org) {
    return _userRepo.findAllByOrganization(org);
  }

  /**
   * Fetches a list of ApiUsers that belong to an Organization and has the ADMIN role, sorted by
   * last name, first name, and middle name
   *
   * @param org - Organization
   * @return List of ApiUsers with ADMIN role in the org
   */
  public List<ApiUser> getOrgAdminUsers(Organization org) {
    return _userRepo.findAllByOrganizationAndRole(org, OrganizationRole.ADMIN);
  }

  /**
   * Fetches a count of ApiUsers that have permission to access the one defined facility and do not
   * have the ALL_FACILITIES and/or ADMIN roles
   *
   * @param facility - Facility to get count for
   * @return Integer - count of ApiUsers
   */
  public Integer getUsersWithSingleFacilityAccessCount(Facility facility) {
    List<ApiUser> users =
        _userRepo.findAllByFacilityAndRoles(
            facility, List.of(OrganizationRole.USER, OrganizationRole.ENTRY_ONLY));
    return users.stream()
        .filter(user -> user.getFacilities().size() <= 1)
        .collect(Collectors.toList())
        .size();
  }
}
