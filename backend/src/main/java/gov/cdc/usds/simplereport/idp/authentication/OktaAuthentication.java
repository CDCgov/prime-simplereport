package gov.cdc.usds.simplereport.idp.authentication;

import com.okta.authn.sdk.AuthenticationException;
import com.okta.sdk.error.ErrorCause;
import java.util.List;
import java.util.Optional;

/**
 * Created by emmastephenson on 4/28/21
 *
 * <p>Handles all Okta-related authenticaton.
 */
public interface OktaAuthentication {

  public Optional<List<ErrorCause>> setPassword(String authenticationToken, char[] password)
      throws AuthenticationException;

  public void setRecoveryQuestions(String recoveryQuestion, String answer);
}
