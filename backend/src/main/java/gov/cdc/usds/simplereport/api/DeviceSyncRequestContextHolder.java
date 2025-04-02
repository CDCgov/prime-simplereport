package gov.cdc.usds.simplereport.api;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.WebApplicationContext;

@Repository
@Scope(scopeName = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class DeviceSyncRequestContextHolder {
  private boolean _isDeviceSyncRequest = false;

  public void setIsDeviceSyncRequest(boolean status) {
    this._isDeviceSyncRequest = status;
  }

  public boolean isDeviceSyncRequest() {
    return _isDeviceSyncRequest;
  }
}
