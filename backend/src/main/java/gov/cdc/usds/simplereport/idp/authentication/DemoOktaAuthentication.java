package gov.cdc.usds.simplereport.idp.authentication;

import com.okta.sdk.resource.user.factor.FactorStatus;
import com.okta.sdk.resource.user.factor.FactorType;
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
  private static final int PHONE_NUMBER_LENGTH = 10;
  private static final int PASSCODE_LENGTH = 6;

  private HashMap<String, DemoAuthUser> idToUserMap;

  public DemoOktaAuthentication() {
    this.idToUserMap = new HashMap<>();
  }

  public String activateUser(String activationToken, String crossForwardedHeader, String userAgent)
      throws InvalidActivationLinkException {
    if (activationToken == null || activationToken.isEmpty()) {
      throw new InvalidActivationLinkException("User could not be activated");
    }
    String userId = "userId " + activationToken;
    this.idToUserMap.put(userId, new DemoAuthUser(userId));
    return userId;
  }

  public String activateUser(String activationToken) throws InvalidActivationLinkException {
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
    this.idToUserMap.get(userId).setPassword(String.valueOf(password));
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

    DemoAuthUser user = this.idToUserMap.get(userId);
    user.setRecoveryQuestion(question);
    user.setRecoveryAnswer(answer);
  }

  public String enrollSmsMfa(String userId, String phoneNumber)
      throws OktaAuthenticationFailureException {
    validateUser(userId);
    String strippedPhoneNumber = validatePhoneNumber(phoneNumber);
    String factorId = userId + strippedPhoneNumber;
    DemoMfa smsMfa =
        new DemoMfa(FactorType.SMS, strippedPhoneNumber, factorId, FactorStatus.PENDING_ACTIVATION);
    this.idToUserMap.get(userId).setMfa(smsMfa);
    return factorId;
  }

  public String enrollVoiceCallMfa(String userId, String phoneNumber)
      throws OktaAuthenticationFailureException {
    validateUser(userId);
    String strippedPhoneNumber = validatePhoneNumber(phoneNumber);
    String factorId = userId + strippedPhoneNumber;
    DemoMfa callMfa =
        new DemoMfa(
            FactorType.CALL, strippedPhoneNumber, factorId, FactorStatus.PENDING_ACTIVATION);
    this.idToUserMap.get(userId).setMfa(callMfa);
    return factorId;
  }

  public String enrollEmailMfa(String userId, String email)
      throws OktaAuthenticationFailureException {
    validateUser(userId);
    if (!email.contains("@")) {
      throw new OktaAuthenticationFailureException("Email address is invalid.");
    }
    String factorId = userId + email;
    DemoMfa emailMfa =
        new DemoMfa(FactorType.EMAIL, email, factorId, FactorStatus.PENDING_ACTIVATION);
    this.idToUserMap.get(userId).setMfa(emailMfa);
    return factorId;
  }

  // unlike the real implementation, this returns a factor and passcode directly (instead of a qr
  // code to use for enrollment.)
  public JSONObject enrollAuthenticatorAppMfa(String userId, String appType)
      throws OktaAuthenticationFailureException {
    validateUser(userId);
    String factorType = "";
    switch (appType.toLowerCase()) {
      case "google":
        factorType = "authApp: google";
        break;
      case "okta":
        factorType = "authApp: okta";
        break;
      default:
        throw new OktaAuthenticationFailureException("App type not recognized.");
    }
    String factorId = factorType + " " + userId;
    DemoMfa appMfa =
        new DemoMfa(
            FactorType.TOKEN_SOFTWARE_TOTP,
            "thisIsAFakeQrCode",
            factorId,
            FactorStatus.PENDING_ACTIVATION);
    this.idToUserMap.get(userId).setMfa(appMfa);
    JSONObject response = new JSONObject();
    response.put("qrcode", "thisIsAFakeQrCode");
    response.put("factorId", factorId);
    return response;
  }

  public JSONObject enrollSecurityKey(String userId) throws OktaAuthenticationFailureException {
    validateUser(userId);
    String factorId = "webAuthnFactorId + " + userId;
    JSONObject json =
        new JSONObject(
            "{ \"factorId\":"
                + factorId
                + ", \"activation\": { \"challenge\": \"challengeString\",\"user\": {\"id\":"
                + userId
                + "}}}");
    DemoMfa securityKeyMfa =
        new DemoMfa(FactorType.WEBAUTHN, "FIDO", factorId, FactorStatus.PENDING_ACTIVATION);
    this.idToUserMap.get(userId).setMfa(securityKeyMfa);
    return json;
  }

  public void activateSecurityKey(
      String userId, String factorId, String attestation, String clientData)
      throws OktaAuthenticationFailureException {
    System.out.println("in demo");
    validateUser(userId);
    System.out.println("user validated");
    System.out.println("factorId: " + factorId);
    System.out.println("demoMfa:" + this.idToUserMap.get(userId).getMfa());
    System.out.println("demoMfa factorId: " + this.idToUserMap.get(userId).getMfa().getFactorId());
    validateFactor(userId, factorId);
    System.out.println("factor validated");
    if (attestation == null || attestation.isEmpty()) {
      throw new OktaAuthenticationFailureException("attestation cannot be empty.");
    }
    System.out.println("attestation accepted");
    if (clientData == null || clientData.isEmpty()) {
      throw new OktaAuthenticationFailureException("clientData cannot be empty.");
    }
    System.out.println("attestation accepted");
    DemoMfa mfa = this.idToUserMap.get(userId).getMfa();
    mfa.setFactorStatus(FactorStatus.ACTIVE);
    System.out.println("done with demo");
  }

  public void verifyActivationPasscode(String userId, String factorId, String passcode)
      throws OktaAuthenticationFailureException {
    validateUser(userId);
    validateFactor(userId, factorId);
    DemoMfa mfa = this.idToUserMap.get(userId).getMfa();
    if (passcode.length() != PASSCODE_LENGTH) {
      throw new OktaAuthenticationFailureException(
          "Activation passcode could not be verifed; MFA activation failed.");
    }
    mfa.setFactorStatus(FactorStatus.ACTIVE);
  }

  public void resendActivationPasscode(String userId, String factorId)
      throws OktaAuthenticationFailureException {
    validateUser(userId);
    validateFactor(userId, factorId);
    DemoMfa mfa = this.idToUserMap.get(userId).getMfa();
    FactorType factorType = mfa.getFactorType();
    if (!(factorType == FactorType.SMS
        || factorType == FactorType.CALL
        || factorType == FactorType.EMAIL)) {
      throw new OktaAuthenticationFailureException(
          "The requested activation factor could not be resent; Okta returned an error.");
    }
    mfa.setFactorStatus(FactorStatus.PENDING_ACTIVATION);
  }

  public void validateUser(String userId) throws OktaAuthenticationFailureException {
    if (!this.idToUserMap.containsKey(userId)) {
      throw new OktaAuthenticationFailureException("User id not recognized.");
    }
  }

  public void validateFactor(String userId, String factorId)
      throws OktaAuthenticationFailureException {
    DemoMfa mfa = this.idToUserMap.get(userId).getMfa();
    if (mfa == null || factorId.strip() != mfa.getFactorId().strip()) {
      System.out.println("the factor could not be validated!");
      System.out.println("factorId: " + factorId);
      System.out.println("factorId off demo: " + mfa.getFactorId());
      throw new OktaAuthenticationFailureException("Could not retrieve factor.");
    }
  }

  public String validatePhoneNumber(String phoneNumber) throws OktaAuthenticationFailureException {
    String strippedPhoneNumber = phoneNumber.replaceAll("[^\\d]", "");
    if (strippedPhoneNumber.length() != PHONE_NUMBER_LENGTH) {
      throw new OktaAuthenticationFailureException("Phone number is invalid.");
    }
    return strippedPhoneNumber;
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

    @Getter @Setter private FactorType factorType;
    @Getter @Setter private String factorProfile;
    @Getter @Setter private String factorId;
    @Getter @Setter private FactorStatus factorStatus;
  }
}
