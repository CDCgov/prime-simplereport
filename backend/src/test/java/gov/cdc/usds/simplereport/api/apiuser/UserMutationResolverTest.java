package gov.cdc.usds.simplereport.api.apiuser;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.db.model.Organization;
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
  @Mock ApiUserService mockedApiUserService;

  @Autowired private TestDataFactory _dataFactory;

  private UserInfo orgUserInfo;

  @InjectMocks UserMutationResolver userMutationResolver;

  @BeforeEach
  void setup() {
    Organization org = _dataFactory.saveValidOrganization();
    orgUserInfo = _dataFactory.createValidApiUser("demo@example.com", org);
  }

  @Test
  void reactivateUserAndResetPassword_orgAdmin_success() {
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
}
