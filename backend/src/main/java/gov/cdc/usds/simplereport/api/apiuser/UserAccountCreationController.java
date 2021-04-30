package gov.cdc.usds.simplereport.api.apiuser;

import static gov.cdc.usds.simplereport.config.WebConfiguration.USER_ACCOUNT_REQUEST;

import java.util.Enumeration;

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
import gov.cdc.usds.simplereport.api.model.useraccountcreation.UserAccountCreationRequest;
import gov.cdc.usds.simplereport.idp.authentication.OktaAuthentication;

/** Controller used for user account creation. */
// NOTE: This class is not currently functional; it's a WIP so that the frontend has endpoints to
// query.
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
   * WIP Validates that the requesting user has been sent an invitation to SimpleReport, ensures the
   * given password meets all requirements, and sets the password in Okta. If the password doesn't
   * meet requirements, sends a notice back to the frontend.
   *
   * @param session
   * @return the session id (temporary)
   */
  @PostMapping("/set-password")
  public void setPassword(@RequestBody UserAccountCreationRequest requestBody, HttpServletRequest request) throws Exception {
    _oktaAuth.setPassword(request.getHeader("authorization"), requestBody.getPassword().toCharArray());

    // steps here:
    // strip important information out of the session (can probably do that here and have the rest
    // of the password setting be done in a separate private method)
    // add authentication, in the form of getting the Okta token out of the HTTP session (or
    // servlet? look at patient experience controller for example)
    // extract the password, run some preliminary checks on it, and either return an error or set
    // the password in Okta

    // frontend requirements:
    // okta token will come through the header
    // bubble exceptions to the frontend (return void)
  }

  /**
   * WIP Sets a recovery question for the given session/user in Okta.
   *
   * @param session
   * @return the session id (temporary)
   */
  @PostMapping("/set-recovery-question")
  public String setRecoveryQuestions(HttpSession session) {
    // for the authorization on this, probably just need to assert that the session exists.
    // may also be a good idea to put an attribute on the session, something like "authenticated"
    // the alternative is to use the Okta authorization token again, but that's probably a one-time-use?
    // at any rate, we need the session id for something
    return session.getId();
  }
}
