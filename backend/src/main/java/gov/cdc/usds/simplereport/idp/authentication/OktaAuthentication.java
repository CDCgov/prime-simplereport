package gov.cdc.usds.simplereport.idp.authentication;

import com.okta.authn.sdk.AuthenticationException;
import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;

/**
 * Created by emmastephenson on 4/28/21
 *
 * <p>Handles all Okta-related authenticaton.
 */
public interface OktaAuthentication {

  public String getStateTokenFromActivationToken(
      String activationToken, String requestingIpAddress, String userAgent) throws InvalidActivationLinkException;

  public String setPassword(String stateToken, char[] password) throws AuthenticationException;

  public void setRecoveryQuestions(String recoveryQuestion, String answer);
}
