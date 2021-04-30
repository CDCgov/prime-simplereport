package gov.cdc.usds.simplereport.idp.authentication;

import com.okta.authn.sdk.AuthenticationException;
import com.okta.authn.sdk.client.AuthenticationClient;
import com.okta.authn.sdk.client.AuthenticationClients;
import com.okta.spring.boot.sdk.config.OktaClientProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Created by emmastephenson on 4/28/21
 *
 * <p>Handles all Okta-related authenticaton.
 */
@Service
public class LiveOktaAuthentication implements OktaAuthentication {
  private AuthenticationClient _client;

  public LiveOktaAuthentication(
      OktaClientProperties oktaClientProperties,
      @Value("${okta.oauth2.client-id}") String oktaOAuth2ClientId) {
    _client = AuthenticationClients.builder().setOrgUrl(oktaClientProperties.getOrgUrl()).build();
  }

  public void setPassword(String authenticationToken, char[] password)
      throws AuthenticationException {
        _client.resetPassword(password, authenticationToken, new OktaStateHandler());
    // try {
    //   _client.resetPassword(password, authenticationToken, new OktaStateHandler());
    // } catch (CredentialsException e) {
    //   // Password failed to meet Okta standards.
    //   return Optional.of(e.getCauses());
    // }
    // return Optional.empty();
  }

  public void setRecoveryQuestions(String question, String answer) {
    // changeRecoveryQuestion is a method of API user, not AuthenticationClient like
    // resetting the password.
    // it requires the user id, password, and question/answer
    // the user/password information can probably be extracted from setPassword and
    // passed here, though that likely needs to happen in the REST handler (since it might
    // involve session ids)
  }
}
