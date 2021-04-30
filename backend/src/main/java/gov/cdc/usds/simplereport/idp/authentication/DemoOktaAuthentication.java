package gov.cdc.usds.simplereport.idp.authentication;

import com.okta.sdk.error.ErrorCause;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DemoOktaAuthentication implements OktaAuthentication {

  private HashSet<String> validAuthenticationTokens;

  public DemoOktaAuthentication() {
    this.validAuthenticationTokens = new HashSet<String>();
  }

  public void setPassword(String authenticationToken, char[] password)
      throws Exception {
    if (!validAuthenticationTokens.contains(authenticationToken)) {
      throw new Exception("Authentication token not recognized.");
    }
    if (password.length < 8) {
      ErrorCause cause = new TestErrorCause("password is too short");
    //   return Optional.of(List.of(cause));
    }
    Pattern specialCharacters = Pattern.compile("[^a-z0-9 ]", Pattern.CASE_INSENSITIVE);
    Matcher matcher = specialCharacters.matcher(password.toString());
    if (!matcher.find()) {
      ErrorCause cause = new TestErrorCause("password does not contain any special characters");
    //   return Optional.of(List.of(cause));
    }
    // return Optional.empty();
  }

  public void setRecoveryQuestions(String question, String answer) {
    // when recovery question logic is added, implement it here
  }

  public void addAuthenticationToken(String authenticationToken) {
    this.validAuthenticationTokens.add(authenticationToken);
  }

  class TestErrorCause implements ErrorCause {
    private String cause;
    private String href;

    public TestErrorCause(String cause) {
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
