package gov.cdc.usds.simplereport.idp.authentication;

import com.okta.authn.sdk.AuthenticationException;

/**
 * Created by emmastephenson on 4/28/21
 *
 * <p>Handles all Okta-related authenticaton.
 */
public interface OktaAuthentication {

  public String getStateTokenFromActivationToken(
      String activationToken, String requestingIpAddress, String userAgent) throws Exception;

  public String setPassword(String stateToken, char[] password) throws AuthenticationException;

  public void setRecoveryQuestions(String recoveryQuestion, String answer);
}
