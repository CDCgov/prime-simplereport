package gov.cdc.usds.simplereport.idp.authentication;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DemoOktaAuthenticationTest {

  private DemoOktaAuthentication _auth = new DemoOktaAuthentication();

  private static final String VALID_ACTIVATION_TOKEN = "valid_activation_token";

  @BeforeEach
  public void setup() {
    _auth.reset();
  }

  @Test
  void activateUserSuccessful() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    assertThat(_auth.getUser(userId)).isNotNull();
  }

  @Test
  void activateUserFails_withoutActivationToken() throws Exception {
    assertThrows(
        InvalidActivationLinkException.class,
        () -> {
          _auth.activateUser("");
        });
  }

  @Test
  void setPasswordSuccessful() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String password = "dummyPassword!";
    _auth.setPassword(userId, password.toCharArray());
    assertThat(_auth.getUser(userId).getPassword()).isEqualTo(password);
  }

  @Test
  void cannotSetPassword_unlessActivationIsCalled() throws Exception {
    char[] password = "dummyPassword!".toCharArray();
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setPassword("invalidUserId", password);
            });
    assertThat(exception.getMessage()).isEqualTo("User id not recognized.");
  }

  @Test
  void passwordTooShort() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    char[] password = "short".toCharArray();
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setPassword(userId, password);
            });
    assertThat(exception.getMessage()).isEqualTo("Password is too short.");
  }

  @Test
  void passwordNoSpecialCharacters() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    char[] password = "longPasswordWithoutSpecialCharacters".toCharArray();
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setPassword(userId, password);
            });
    assertThat(exception.getMessage())
        .isEqualTo("Password does not contain any special characters.");
  }

  @Test
  void setRecoveryQuestionSuccessful() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String question = "Who was your third grade teacher?";
    String answer = "Teacher";
    _auth.setRecoveryQuestion(userId, question, answer);
    assertThat(_auth.getUser(userId).getRecoveryQuestion()).isEqualTo(question);
    assertThat(_auth.getUser(userId).getRecoveryAnswer()).isEqualTo(answer);
  }

  @Test
  void cannotSetRecoveryQuestion_withoutValidActivation() throws Exception {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setRecoveryQuestion(
                  "fakeUserId", "Who was your third grade teacher?", "Teacher");
            });

    assertThat(exception.getMessage()).isEqualTo("User id not recognized.");
  }

  @Test
  void cannotSetRecoveryQuestion_withBlankQuestion() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setRecoveryQuestion(userId, " ", "Teacher");
            });
    assertThat(exception.getMessage()).isEqualTo("Recovery question cannot be empty.");
  }

  @Test
  void cannotSetRecoveryQuestion_withBlankAnswer() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setRecoveryQuestion(userId, "Who was your third grade teacher?", " ");
            });
    assertThat(exception.getMessage()).isEqualTo("Recovery answer cannot be empty.");
  }
}
