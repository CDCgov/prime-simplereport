package gov.cdc.usds.simplereport.api;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.WebApplicationContext;

@Repository
@Scope(scopeName = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class CurrentUIVersionContextHolder {
  private String uiShaFromHeaders;

  public String getUiShaFromHeaders() {
    return uiShaFromHeaders;
  }

  public void setUiShaFromHeaders(String uiShaFromHeaders) {
    this.uiShaFromHeaders = uiShaFromHeaders;
  }
}
