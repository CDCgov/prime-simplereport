package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.service.model.UserInfo;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.WebApplicationContext;

@Repository
@Scope(scopeName = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class CurrentUserContextHolder {
  private UserInfo _user;

  public UserInfo getUser() {
    return _user;
  }

  public boolean hasBeenPopulated() {
    return _user != null;
  }

  public void setUser(UserInfo user) {
    this._user = user;
  }
}
