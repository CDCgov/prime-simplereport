package gov.cdc.usds.simplereport.idp.authentication;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

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
    String authToken = "correct_okta_authentication";
    String password = "dummyPassword!";
    _auth.addAuthenticationToken(authToken);
    _auth.setPassword(authToken, password.toCharArray());
    assertThat(_auth.getPasswords().containsValue(password));
  }

  @Test
  void invalidAuthenticationToken() throws Exception {
    String password = "dummyPassword!";
    assertThrows(
        AuthenticationException.class,
        () -> {
          _auth.setPassword("invalidAuthenticationToken", password.toCharArray());
        });
  }

  @Test
  void passwordTooShort() throws Exception {
    String authToken = "correct_okta_authentication";
    String password = "short";
    _auth.addAuthenticationToken(authToken);
    assertThrows(
        CredentialsException.class,
        () -> {
          _auth.setPassword(authToken, password.toCharArray());
        });
  }

  @Test
  void passwordNoSpecialCharacters() throws Exception {
    String authToken = "correct_okta_authentication";
    String password = "longPasswordNoSpecialCharacters";
    _auth.addAuthenticationToken(authToken);
    assertThrows(
        CredentialsException.class,
        () -> {
          _auth.setPassword(authToken, password.toCharArray());
        });
  }
}
