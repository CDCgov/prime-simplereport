package gov.cdc.usds.simplereport.idp.authentication;

import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import org.json.JSONObject;

/**
 * Created by emmastephenson on 4/28/21
 *
 * <p>Handles all Okta-related authenticaton.
 */
public interface OktaAuthentication {

  public JSONObject activateUser(
      String activationToken, String crossForwardedHeader, String userAgent)
      throws InvalidActivationLinkException;

  public void setPassword(String userId, char[] password) throws OktaAuthenticationFailureException;

  public void setRecoveryQuestion(String userId, String recoveryQuestion, String answer)
      throws OktaAuthenticationFailureException;
}
