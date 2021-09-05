package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.WebApplicationContext;

@Repository
@Scope(scopeName = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class ApiUserContextHolder {
  private ApiUser apiUser = null;

  public ApiUser getCurrentApiUser() {
    return apiUser;
  }

  public boolean hasBeenPopulated() {
    return apiUser != null;
  }

  public void setCurrentApiUser(ApiUser apiUser) {
    this.apiUser = apiUser;
  }
}
