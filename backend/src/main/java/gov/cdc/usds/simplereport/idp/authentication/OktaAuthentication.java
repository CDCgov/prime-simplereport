package gov.cdc.usds.simplereport.idp.authentication;

import com.okta.authn.sdk.AuthenticationException;

/**
 * Created by emmastephenson on 4/28/21
 *
 * <p>Handles all Okta-related authenticaton.
 */
public interface OktaAuthentication {

  public void setPassword(String authenticationToken, char[] password)
      throws AuthenticationException;

  public void setRecoveryQuestions(String recoveryQuestion, String answer);
}
