package gov.cdc.usds.simplereport.idp.authentication;

import com.okta.authn.sdk.AuthenticationException;
import com.okta.authn.sdk.CredentialsException;
import com.okta.sdk.error.Error;
import com.okta.sdk.error.ErrorCause;
import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Profile(BeanProfiles.NO_OKTA_AUTH)
@Service
public class DemoOktaAuthentication implements OktaAuthentication {

  private static final int ERROR_STATUS_CODE = 403;
  private static final int MINIMUM_PASSWORD_LENGTH = 8;

  private HashSet<String> validStateTokens;
  private HashMap<String, String> stateTokenToPasswordMap;

  public DemoOktaAuthentication() {
    this.validStateTokens = new HashSet<>();
    this.stateTokenToPasswordMap = new HashMap<>();
  }

  public String getStateTokenFromActivationToken(
      String activationToken, String requestingIpAddress, String userAgent)
      throws InvalidActivationLinkException {
    if (activationToken == null || activationToken.isEmpty()) {
      throw new InvalidActivationLinkException();
    }
    String stateToken = "stateToken " + activationToken;
    this.validStateTokens.add(stateToken);
    return stateToken;
  }

  public String getStateTokenFromActivationToken(String activationToken)
      throws InvalidActivationLinkException {
    return getStateTokenFromActivationToken(activationToken, "", "");
  }

  public String setPassword(String stateToken, char[] password) throws AuthenticationException {
    if (!this.validStateTokens.contains(stateToken)) {
      DemoError authError = new DemoError("State token not recognized.");
      throw new AuthenticationException(authError);
    }
    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      DemoError passwordError = new DemoError("Password is too short.");
      throw new CredentialsException(passwordError);
    }
    Pattern specialCharacters = Pattern.compile("[^a-zA-Z0-9]");
    Matcher matcher = specialCharacters.matcher(String.valueOf(password));
    boolean found = matcher.find();
    if (!found) {
      DemoError passwordError = new DemoError("Password does not contain any special characters.");
      throw new CredentialsException(passwordError);
    }
    this.stateTokenToPasswordMap.put(stateToken, String.valueOf(password));
    return stateToken;
  }

  public void setRecoveryQuestions(String question, String answer) {
    // when recovery question logic is added, implement it here
  }

  public Map<String, String> getPasswords() {
    return this.stateTokenToPasswordMap;
  }

  public void reset() {
    this.validStateTokens.clear();
    this.stateTokenToPasswordMap.clear();
  }

  class DemoError implements Error {
    private String errorMessage;
    private int status;
    private List<ErrorCause> causes;

    public DemoError(String errorMessage) {
      this.errorMessage = errorMessage;
      this.status = ERROR_STATUS_CODE;
      this.causes = List.of(new DemoErrorCause(errorMessage));
    }

    public String getMessage() {
      return this.errorMessage;
    }

    public int getStatus() {
      return this.status;
    }

    public String getCode() {
      // Error code as provided by Okta implementation:
      // https://github.com/okta/okta-auth-java/blob/866e9a0d27d83bb9732bca4da14eeaaa2706eadd/api/src/main/java/com/okta/authn/sdk/AuthenticationFailureException.java#L28
      return "E0000004";
    }

    public Map<String, List<String>> getHeaders() {
      return Map.of("", List.of(""));
    }

    public String getId() {
      return "";
    }

    public List<ErrorCause> getCauses() {
      return this.causes;
    }
  }

  class DemoErrorCause implements ErrorCause {

    private String cause;
    private String href;

    public DemoErrorCause(String cause) {
      this.cause = cause;
    }

    public String getSummary() {
      return this.cause;
    }

    public void setResourceHref(String href) {
      this.href = href;
    }

    public String getResourceHref() {
      return this.href;
    }
  }
}
