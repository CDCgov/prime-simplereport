package gov.cdc.usds.simplereport.idp.authentication;

import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import com.okta.authn.sdk.AuthenticationStateHandlerAdapter;
import com.okta.authn.sdk.resource.AuthenticationResponse;
import com.okta.authn.sdk.resource.AuthenticationStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OktaStateHandler extends AuthenticationStateHandlerAdapter {

  private static final Logger LOG = LoggerFactory.getLogger(OktaStateHandler.class);

  private OktaAuthenticationFailureException failureException;

  @Override
  public void handleSuccess(AuthenticationResponse response) {
    LOG.info("Successful Okta authentication.");
  }

  @Override
  public void handleUnknown(AuthenticationResponse response) {
    AuthenticationStatus status = response.getStatus();
    LOG.info("Unknown error occured during Okta authentication: {} ", status.name());
    failureException =
        new OktaAuthenticationFailureException(
            "Unknown error occured during Okta authentication: " + status.name());
  }

  public void throwExceptionIfNecessary() throws Exception {
    if (failureException != null) {
      throw failureException;
    }
  }
}
