package gov.cdc.usds.simplereport.api;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.WebApplicationContext;

@Repository
@Scope(scopeName = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class WebhookContextHolder {
  private boolean _isWebhook = false;

  public void setIsWebhook(boolean status) {
    this._isWebhook = status;
  }

  public boolean isWebhook() {
    return _isWebhook;
  }
}
