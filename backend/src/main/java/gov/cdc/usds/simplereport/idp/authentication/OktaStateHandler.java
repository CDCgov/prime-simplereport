package gov.cdc.usds.simplereport.idp.authentication;

import com.okta.authn.sdk.AuthenticationStateHandlerAdapter;
import com.okta.authn.sdk.resource.AuthenticationResponse;
import com.okta.authn.sdk.resource.AuthenticationStatus;
import javax.naming.AuthenticationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OktaStateHandler extends AuthenticationStateHandlerAdapter {

  private static final Logger LOG = LoggerFactory.getLogger(OktaStateHandler.class);

  private Exception failureException;

  @Override
  public void handleSuccess(AuthenticationResponse response) {
    LOG.info("Successful Okta authentication.");
  }

  @Override
  public void handleUnknown(AuthenticationResponse response) {
    AuthenticationStatus status = response.getStatus();
    LOG.info("Unknown error occured during Okta authentication: " + status.name());
    failureException =
        new AuthenticationException(
            "Unknown error occured during Okta authentication: " + status.name());
  }

  public void throwExceptionIfNecessary() throws Exception {
    if (failureException != null) {
      throw failureException;
    }
  }
}
