package gov.cdc.usds.simplereport.idp.authentication;

import com.okta.authn.sdk.AuthenticationException;
import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
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

  public void setPassword(String userId, char[] password) throws AuthenticationException;

  public void setRecoveryQuestions(String userId, String recoveryQuestion, String answer);
}
