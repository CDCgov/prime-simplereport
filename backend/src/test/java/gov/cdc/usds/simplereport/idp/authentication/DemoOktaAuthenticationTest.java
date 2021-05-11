package gov.cdc.usds.simplereport.idp.authentication;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.okta.authn.sdk.AuthenticationException;
import com.okta.authn.sdk.CredentialsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DemoOktaAuthenticationTest {

  private DemoOktaAuthentication _auth = new DemoOktaAuthentication();

  @BeforeEach
  public void setup() {
    _auth.reset();
  }

  @Test
  void validAuthToken() throws Exception {
    String stateToken = _auth.getStateTokenFromActivationToken("valid_activation_token");
    String password = "dummyPassword!";
    _auth.setPassword(stateToken, password.toCharArray());
    assertTrue(_auth.getPasswords().containsValue(password));
  }

  @Test
  void invalidStateToken() throws Exception {
    String password = "dummyPassword!";
    assertThrows(
        AuthenticationException.class,
        () -> {
          _auth.setPassword("invalidStateToken", password.toCharArray());
        });
  }

  @Test
  void passwordTooShort() throws Exception {
    String stateToken = _auth.getStateTokenFromActivationToken("valid_activation_token");
    String password = "short";
    assertThrows(
        CredentialsException.class,
        () -> {
          _auth.setPassword(stateToken, password.toCharArray());
        });
  }

  @Test
  void passwordNoSpecialCharacters() throws Exception {
    String stateToken = _auth.getStateTokenFromActivationToken("valid_activation_token");
    String password = "longPasswordNoSpecialCharacters";
    assertThrows(
        CredentialsException.class,
        () -> {
          _auth.setPassword(stateToken, password.toCharArray());
        });
  }
}
