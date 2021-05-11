package gov.cdc.usds.simplereport.idp.authentication;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DemoOktaAuthenticationTest {

  private DemoOktaAuthentication _auth = new DemoOktaAuthentication();

  private static final String USER_ID_KEY = "userId";
  private static final String VALID_ACTIVATION_TOKEN = "valid_activation_token";

  @BeforeEach
  public void setup() {
    _auth.reset();
  }

  @Test
  void activateUserSuccessful() throws Exception {
    JSONObject json = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String userId = json.getString(USER_ID_KEY);
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
    JSONObject json = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String userId = json.getString(USER_ID_KEY);
    String password = "dummyPassword!";
    _auth.setPassword(userId, password.toCharArray());
    assertThat(_auth.getUser(userId).getPassword()).isEqualTo(password);
  }

  @Test
  void cannotSetPassword_unlessActivationIsCalled() throws Exception {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setPassword("invalidUserId", "dummyPassword!".toCharArray());
            });
    assertThat(exception.getMessage()).isEqualTo("User id not recognized.");
  }

  @Test
  void passwordTooShort() throws Exception {
    JSONObject json = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String userId = json.getString(USER_ID_KEY);
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setPassword(userId, "short".toCharArray());
            });
    assertThat(exception.getMessage()).isEqualTo("Password is too short.");
  }

  @Test
  void passwordNoSpecialCharacters() throws Exception {
    JSONObject json = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String userId = json.getString(USER_ID_KEY);
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setPassword(userId, "longPasswordWithoutSpecialCharacters".toCharArray());
            });
    assertThat(exception.getMessage())
        .isEqualTo("Password does not contain any special characters.");
  }

  @Test
  void setRecoveryQuestionsSuccessful() throws Exception {
    JSONObject json = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String userId = json.getString(USER_ID_KEY);
    String question = "Who was your third grade teacher?";
    String answer = "Teacher";
    _auth.setRecoveryQuestions(userId, question, answer);
    assertThat(_auth.getUser(userId).getRecoveryQuestion()).isEqualTo(question);
    assertThat(_auth.getUser(userId).getRecoveryAnswer()).isEqualTo(answer);
  }

  @Test
  void cannotSetRecoveryQuestion_withoutValidActivation() throws Exception {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setRecoveryQuestions(
                  "fakeUserId", "Who was your third grade teacher?", "Teacher");
            });

    assertThat(exception.getMessage()).isEqualTo("User id not recognized.");
  }

  @Test
  void cannotSetRecoveryQuestions_withBlankQuestion() throws Exception {
    JSONObject json = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String userId = json.getString(USER_ID_KEY);
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setRecoveryQuestions(userId, " ", "Teacher");
            });
    assertThat(exception.getMessage()).isEqualTo("Recovery question cannot be empty.");
  }

  @Test
  void cannotSetRecoveryQuestions_withBlankAnswer() throws Exception {
    JSONObject json = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String userId = json.getString(USER_ID_KEY);
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setRecoveryQuestions(userId, "Who was your third grade teacher?", " ");
            });
    assertThat(exception.getMessage()).isEqualTo("Recovery answer cannot be empty.");
  }
}
