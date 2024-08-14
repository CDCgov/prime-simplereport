package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.test_util.TestUserIdentities.DEFAULT_ORGANIZATION;
import static gov.cdc.usds.simplereport.test_util.TestUserIdentities.ORG_ADMIN_USER;
import static gov.cdc.usds.simplereport.test_util.TestUserIdentities.SITE_ADMIN_USER_WITH_ORG;
import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = {"spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"})
class DbAuthorizationServiceTest extends BaseServiceTest<DbAuthorizationService> {
  @Autowired ApiUserService _userService;
  @Autowired FacilityRepository _facilityRepo;
  @Autowired OrganizationService _orgService;

  @BeforeEach
  void setupData() {
    initSampleData();
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportOrgAdminUser
  void getUsersInOrganization_success() {
    Organization org = _orgService.getOrganization(DEFAULT_ORGANIZATION);
    List<ApiUser> users = _service.getUsersInOrganization(org);
    assertEquals(6, users.size());
    assertEquals("admin@example.com", users.get(0).getLoginEmail());
    assertEquals("Andrews", users.get(0).getNameInfo().getLastName());
    assertEquals("bobbity@example.com", users.get(1).getLoginEmail());
    assertEquals("Bobberoo", users.get(1).getNameInfo().getLastName());
    assertEquals("invalid@example.com", users.get(2).getLoginEmail());
    assertEquals("Irwin", users.get(2).getNameInfo().getLastName());
    assertEquals("nobody@example.com", users.get(3).getLoginEmail());
    assertEquals("Nixon", users.get(3).getNameInfo().getLastName());
    assertEquals("notruby@example.com", users.get(4).getLoginEmail());
    assertEquals("Reynolds", users.get(4).getNameInfo().getLastName());
    assertEquals("allfacilities@example.com", users.get(5).getLoginEmail());
    assertEquals("Williams", users.get(5).getNameInfo().getLastName());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportOrgAdminUser
  void getOrgAdminUsers_success() {
    Organization org = _orgService.getOrganization(DEFAULT_ORGANIZATION);
    List<ApiUser> users = _service.getOrgAdminUsers(org);
    assertEquals(2, users.size());
    assertEquals(ORG_ADMIN_USER, users.get(0).getLoginEmail());
    assertEquals("Andrews", users.get(0).getNameInfo().getLastName());
    assertEquals(Set.of(OrganizationRole.ADMIN), users.get(0).getRoles());
    assertEquals(SITE_ADMIN_USER_WITH_ORG, users.get(1).getLoginEmail());
    assertEquals("Reynolds", users.get(1).getNameInfo().getLastName());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void getUserWithSingleFacilityAccessCount_success() {
    Organization org = _dataFactory.saveOrganization("ABC org", "k12", "ABC_ORG", true);
    Facility fac1 = _dataFactory.createValidFacility(org, "BCD Facility");
    Facility fac2 = _dataFactory.createValidFacility(org, "CDE Facility");
    _dataFactory.createValidApiUser("user1@example.com", org, Role.ADMIN, Set.of());
    _dataFactory.createValidApiUser("user2@example.com", org, Role.ENTRY_ONLY, Set.of(fac1));
    _dataFactory.createValidApiUser("user3@example.com", org, Role.USER, Set.of(fac1, fac2));
    UserInfo user4 =
        _dataFactory.createValidApiUser("user4@example.com", org, Role.USER, Set.of(fac1));
    UserInfo user5 =
        _dataFactory.createValidApiUser("user5@example.com", org, Role.USER, Set.of(fac1));

    // ADMIN not counted
    Integer firstCount = _service.getUserWithSingleFacilityAccessCount(fac1);
    assertEquals(3, firstCount);

    // DELETED user not counted
    _userService.setIsDeleted(user4.getInternalId(), true);
    Integer secondCount = _service.getUserWithSingleFacilityAccessCount(fac1);
    assertEquals(2, secondCount);

    // ALL_FACILITIES user not counted
    _userService.updateUserPrivileges(user5.getInternalId(), true, Set.of(), Role.USER);
    Integer thirdCount = _service.getUserWithSingleFacilityAccessCount(fac1);
    assertEquals(1, thirdCount);
  }
}
