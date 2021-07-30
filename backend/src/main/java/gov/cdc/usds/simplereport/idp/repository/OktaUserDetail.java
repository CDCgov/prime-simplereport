package gov.cdc.usds.simplereport.idp.repository;

import com.okta.sdk.resource.user.User;
import com.okta.sdk.resource.user.UserStatus;
import lombok.Getter;

@Getter
public class OktaUserDetail {

  private final UserStatus status;
  private final String id;

  public OktaUserDetail(User oktaUser) {
    status = oktaUser.getStatus();
    id = oktaUser.getId();
  }
}
