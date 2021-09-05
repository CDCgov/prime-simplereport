package gov.cdc.usds.simplereport.api.context;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.WebApplicationContext;

@Repository
@Scope(scopeName = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class SmsWebhookContextHolder {
  private boolean _isSmsWebhook = false;

  public void setIsSmsWebhook(boolean status) {
    this._isSmsWebhook = status;
  }

  public boolean isSmsWebhook() {
    return _isSmsWebhook;
  }
}
