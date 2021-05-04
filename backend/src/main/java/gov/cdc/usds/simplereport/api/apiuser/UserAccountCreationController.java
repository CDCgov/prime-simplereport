package gov.cdc.usds.simplereport.api.apiuser;

import static gov.cdc.usds.simplereport.config.WebConfiguration.USER_ACCOUNT_REQUEST;

import gov.cdc.usds.simplereport.api.model.useraccountcreation.UserAccountCreationRequest;
import gov.cdc.usds.simplereport.idp.authentication.OktaAuthentication;
import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
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
   * @param UserAccountCreationRequest requestBody contains the password
   * @param HttpServletRequest request contains all header information, including the activation
   *     token.
   * @throws Exception if the activation token is invalid.
   * @throws AuthenticationException if the state token passed to Okta is invalid, or if the Okta
   *     state machine is not in a RESET_PASSWORD state.
   * @throws CredentialsException if the password does not meet Okta standards.
   */
  @PostMapping("/set-password")
  public void activateAccountAndSetPassword(
      @RequestBody UserAccountCreationRequest requestBody, HttpServletRequest request)
      throws Exception {
    String stateToken =
        _oktaAuth.getStateTokenFromActivationToken(
            request.getHeader("authorization"),
            request.getHeader("X-Forwarded-For"),
            request.getHeader("User-Agent"));
    String updatedStateToken =
        _oktaAuth.setPassword(stateToken, requestBody.getPassword().toCharArray());
    request.getSession().setAttribute("stateToken", updatedStateToken);
  }

  /**
   * WIP Sets a recovery question for the given session/user in Okta.
   *
   * @param session
   * @return the session id (temporary)
   */
  @PostMapping("/set-recovery-question")
  public String setRecoveryQuestions(HttpSession session) {
    return session.getId();
  }
}
