package gov.cdc.usds.simplereport.api.apiuser;

import static gov.cdc.usds.simplereport.config.WebConfiguration.USER_ACCOUNT_REQUEST;

import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.SetRecoveryQuestionRequest;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.UserAccountCreationRequest;
import gov.cdc.usds.simplereport.idp.authentication.OktaAuthentication;
import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Controller used for user account creation. */
@RestController
@RequestMapping(USER_ACCOUNT_REQUEST)
public class UserAccountCreationController {
  private static final Logger LOG = LoggerFactory.getLogger(UserAccountCreationController.class);

  private static final String STATE_TOKEN_KEY = "stateToken";
  private static final String USER_ID_KEY = "userId";

  @Autowired private OktaAuthentication _oktaAuth;

  @PostConstruct
  private void init() {
    LOG.info(
        "WIP: User account request creation REST endpoint enabled. Not for use in production at this time.");
  }

  /**
   * Validates that the requesting user has been sent an invitation to SimpleReport, ensures the
   * given password meets all requirements, and sets the password in Okta.
   *
   * @param requestBody contains the password
   * @param request contains all header information, including the activation token.
   * @throws InvalidActivationLinkException if the activation token is invalid.
   * @throws OktaAuthenticationFailureException if the password is invalid or if the user is not in
   *     a RESET_PASSWORD state.
   */
  @PostMapping("/initialize-and-set-password")
  public void activateAccountAndSetPassword(
      @RequestBody UserAccountCreationRequest requestBody, HttpServletRequest request)
      throws Exception {
    LOG.info("endpoint hit: initialize-and-set-password");
    JSONObject oktaResponse =
        _oktaAuth.activateUser(
            requestBody.getActivationToken(),
            request.getHeader("X-Forwarded-For"),
            request.getHeader("User-Agent"));
    String userId = oktaResponse.getString(USER_ID_KEY);
    request.getSession().setAttribute(USER_ID_KEY, userId);
    request.getSession().setAttribute(STATE_TOKEN_KEY, oktaResponse.getString(STATE_TOKEN_KEY));
    _oktaAuth.setPassword(userId, requestBody.getPassword().toCharArray());
  }

  /**
   * Sets a recovery question and answer for a user.
   *
   * @param requestBody contains the selected question and user-provided answer
   * @param request contains session information about the user, including their id
   * @throws OktaAuthenticationFailureException if the recovery question or answer don't meet Okta
   *     standards (answers must be at least 4 chars long)
   */
  @PostMapping("/set-recovery-question")
  public void setRecoveryQuestions(
      @RequestBody SetRecoveryQuestionRequest requestBody, HttpServletRequest request) {
    _oktaAuth.setRecoveryQuestion(
        request.getSession().getAttribute(USER_ID_KEY).toString(),
        requestBody.getQuestion(),
        requestBody.getAnswer());
  }
}
