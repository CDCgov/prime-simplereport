package gov.cdc.usds.simplereport.api.apiuser;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;

@WithSimpleReportOrgAdminUser
class UserMutationResolverTest extends BaseServiceTest<ApiUserService> {
  @Autowired ApiUserRepository apiUserRepository;
  @Mock ApiUserService mockedApiUserService;

  @Autowired private TestDataFactory _dataFactory;

  private UserInfo orgUserInfo;

  @InjectMocks UserMutationResolver userMutationResolver;

  @BeforeEach
  void setup() {
    Organization org = _dataFactory.saveValidOrganization();
    orgUserInfo = _dataFactory.createValidApiUser("demo@example.com", org, Role.USER);
  }

  @Test
  void reactivateUserAndResetPassword_success() {
    UUID userInfoInternalId = orgUserInfo.getInternalId();

    // GIVEN
    when(mockedApiUserService.reactivateUserAndResetPassword(userInfoInternalId))
        .thenReturn(orgUserInfo);

    // WHEN
    User resetUser = userMutationResolver.reactivateUserAndResetPassword(userInfoInternalId);

    // THEN
    assertThat(resetUser.getInternalId()).isEqualTo(userInfoInternalId);
    verify(mockedApiUserService, times(1)).reactivateUserAndResetPassword(userInfoInternalId);
  }

  @Test
  void clearUserRolesAndFacilities_nonExistentUser_throwException() {
    String username = orgUserInfo.getEmail();

    // GIVEN
    ApiUser foundUser = apiUserRepository.findByLoginEmail(username).get();
    when(mockedApiUserService.clearUserRolesAndFacilities(username)).thenReturn(foundUser);

    // WHEN
    ApiUser resetUser = userMutationResolver.clearUserRolesAndFacilities(username);

    // THEN
    assertThat(resetUser.getLoginEmail()).isEqualTo(orgUserInfo.getEmail());
    verify(mockedApiUserService, times(1)).clearUserRolesAndFacilities(username);
  }

  @Test
  void clearUserRolesAndFacilities_failure() {
    String username = "nonexistentuser@examplemail.com";

    when(mockedApiUserService.clearUserRolesAndFacilities(username))
        .thenThrow(new NonexistentUserException());

    assertThrows(
        NonexistentUserException.class,
        () -> {
          userMutationResolver.clearUserRolesAndFacilities(username);
        });
  }
}
