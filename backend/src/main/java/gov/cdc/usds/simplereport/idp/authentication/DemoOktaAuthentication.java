package gov.cdc.usds.simplereport.idp.authentication;

import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.json.JSONObject;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Profile(BeanProfiles.NO_OKTA_AUTH)
@Service
public class DemoOktaAuthentication implements OktaAuthentication {

  private static final int MINIMUM_PASSWORD_LENGTH = 8;

  private HashMap<String, DemoUser> idToUserMap;

  public DemoOktaAuthentication() {
    this.idToUserMap = new HashMap<>();
  }

  public JSONObject activateUser(
      String activationToken, String requestingIpAddress, String userAgent)
      throws InvalidActivationLinkException {
    if (activationToken == null || activationToken.isEmpty()) {
      throw new InvalidActivationLinkException();
    }
    String stateToken = "stateToken " + activationToken;
    String userId = "userId " + activationToken;
    this.idToUserMap.put(userId, new DemoUser(userId));
    JSONObject json = new JSONObject();
    json.put("stateToken", stateToken);
    json.put("userId", userId);
    return json;
  }

  public JSONObject activateUser(String activationToken) throws InvalidActivationLinkException {
    return activateUser(activationToken, "", "");
  }

  public void setPassword(String userId, char[] password)
      throws OktaAuthenticationFailureException {
    if (!idToUserMap.containsKey(userId)) {
      throw new OktaAuthenticationFailureException("User id not recognized.");
    }
    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      throw new OktaAuthenticationFailureException("Password is too short.");
    }
    Pattern specialCharacters = Pattern.compile("[^a-zA-Z0-9]");
    Matcher matcher = specialCharacters.matcher(String.valueOf(password));
    boolean found = matcher.find();
    if (!found) {
      throw new OktaAuthenticationFailureException(
          "Password does not contain any special characters.");
    }
    idToUserMap.get(userId).setPassword(String.valueOf(password));
  }

  public void setRecoveryQuestions(String userId, String question, String answer)
      throws OktaAuthenticationFailureException {
    if (!idToUserMap.containsKey(userId)) {
      throw new OktaAuthenticationFailureException("User id not recognized.");
    }
    if (question.isBlank()) {
      throw new OktaAuthenticationFailureException("Recovery question cannot be empty.");
    }
    if (answer.isBlank()) {
      throw new OktaAuthenticationFailureException("Recovery answer cannot be empty.");
    }

    DemoUser user = idToUserMap.get(userId);
    user.setRecoveryQuestion(question);
    user.setRecoveryAnswer(answer);
  }

  public DemoUser getUser(String userId) {
    return this.idToUserMap.get(userId);
  }

  public void reset() {
    this.idToUserMap.clear();
  }

  class DemoUser {

    private String id;
    private String password;
    private String recoveryQuestion;
    private String recoveryAnswer;

    public DemoUser(String id) {
      this.id = id;
      this.password = "";
      this.recoveryQuestion = "";
      this.recoveryAnswer = "";
    }

    public void setPassword(String password) {
      this.password = password;
    }

    public void setRecoveryQuestion(String recoveryQuestion) {
      this.recoveryQuestion = recoveryQuestion;
    }

    public void setRecoveryAnswer(String recoveryAnswer) {
      this.recoveryAnswer = recoveryAnswer;
    }

    public String getUserId() {
      return this.id;
    }

    public String getPassword() {
      return this.password;
    }

    public String getRecoveryQuestion() {
      return this.recoveryQuestion;
    }

    public String getRecoveryAnswer() {
      return this.recoveryAnswer;
    }
  }
}
