package gov.cdc.usds.simplereport.api.context;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.WebApplicationContext;

@Repository
@Scope(scopeName = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class ApiUserContextHolder implements Resettable {
  private ApiUser _apiUser = null;

  public ApiUser getCurrentApiUser() {
    return _apiUser;
  }

  public boolean hasBeenPopulated() {
    return _apiUser != null;
  }

  public void setCurrentApiUser(ApiUser apiUser) {
    this._apiUser = apiUser;
  }

  public void reset() {
    _apiUser = null;
  }
}
