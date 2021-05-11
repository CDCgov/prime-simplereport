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
      String activationToken, String requestingIpAddress, String userAgent)
      throws InvalidActivationLinkException;

  public void setPassword(String userId, char[] password) throws OktaAuthenticationFailureException;

  public void setRecoveryQuestions(String userId, String recoveryQuestion, String answer)
      throws OktaAuthenticationFailureException;
}
