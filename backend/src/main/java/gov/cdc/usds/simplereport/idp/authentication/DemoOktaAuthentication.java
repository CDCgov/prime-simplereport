package gov.cdc.usds.simplereport.idp.authentication;

import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import java.util.HashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.json.JSONObject;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Profile(BeanProfiles.NO_OKTA_AUTH)
@Service
public class DemoOktaAuthentication implements OktaAuthentication {

  private static final int MINIMUM_PASSWORD_LENGTH = 8;

  private HashMap<String, DemoAuthUser> idToUserMap;

  public DemoOktaAuthentication() {
    this.idToUserMap = new HashMap<>();
  }

  public JSONObject activateUser(
      String activationToken, String crossForwardedHeader, String userAgent)
      throws InvalidActivationLinkException {
    if (activationToken == null || activationToken.isEmpty()) {
      throw new InvalidActivationLinkException();
    }
    String stateToken = "stateToken " + activationToken;
    String userId = "userId " + activationToken;
    this.idToUserMap.put(userId, new DemoAuthUser(userId));
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
    validateUser(userId);
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

  public void setRecoveryQuestion(String userId, String question, String answer)
      throws OktaAuthenticationFailureException {
    validateUser(userId);
    if (question.isBlank()) {
      throw new OktaAuthenticationFailureException("Recovery question cannot be empty.");
    }
    if (answer.isBlank()) {
      throw new OktaAuthenticationFailureException("Recovery answer cannot be empty.");
    }

    DemoAuthUser user = idToUserMap.get(userId);
    user.setRecoveryQuestion(question);
    user.setRecoveryAnswer(answer);
  }

  public String enrollSmsMfa(String userId, String phoneNumber)
      throws OktaAuthenticationFailureException {
    validateUser(userId);
    String strippedPhoneNumber = phoneNumber.replaceAll("[^\\d]", "");
    if (strippedPhoneNumber.length() != 10) {
      throw new OktaAuthenticationFailureException("Phone number is invalid.");
    }
    String factorId = "smsFactor " + strippedPhoneNumber;
    DemoMfa smsMfa = new DemoMfa("smsFactor", strippedPhoneNumber, factorId);
    idToUserMap.get(userId).setMfa(smsMfa);
    return factorId;
  }

  public void validateUser(String userId) throws OktaAuthenticationFailureException {
    if (!idToUserMap.containsKey(userId)) {
      throw new OktaAuthenticationFailureException("User id not recognized.");
    }
  }

  public DemoAuthUser getUser(String userId) {
    return this.idToUserMap.get(userId);
  }

  public void reset() {
    this.idToUserMap.clear();
  }

  class DemoAuthUser {

    @Getter private String id;
    @Getter @Setter private String password;
    @Getter @Setter private String recoveryQuestion;
    @Getter @Setter private String recoveryAnswer;
    @Getter @Setter private DemoMfa mfa;

    public DemoAuthUser(String id) {
      this.id = id;
    }
  }

  @AllArgsConstructor
  class DemoMfa {

    @Getter @Setter private String factorType;
    @Getter @Setter private String factorProfile;
    @Getter @Setter private String factorId;
  }
}
