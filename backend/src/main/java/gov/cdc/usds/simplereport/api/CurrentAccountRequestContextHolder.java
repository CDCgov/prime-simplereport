package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.db.model.Organization;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.WebApplicationContext;

@Repository
@Scope(scopeName = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class CurrentAccountRequestContextHolder {
  private boolean _isAccountRequest = false;
  private Organization _createdOrg;

  public Organization getCreatedOrg() {
    return _createdOrg;
  }

  public void setCreatedOrg(Organization _createdOrg) {
    this._createdOrg = _createdOrg;
  }

  public void setIsAccountRequest(boolean status) {
    this._isAccountRequest = status;
  }

  public boolean isAccountRequest() {
    return _isAccountRequest;
  }
}
