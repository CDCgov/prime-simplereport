package gov.cdc.usds.simplereport.api.apiuser;

import static gov.cdc.usds.simplereport.config.WebConfiguration.USER_ACCOUNT_REQUEST;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Controller used for user account creation. */
// NOTE: This class is not currently functional; it's a WIP so that the frontend has endpoints to
// query.
@RestController
@RequestMapping(USER_ACCOUNT_REQUEST)
public class UserAccountCreationController {
  private static final Logger LOG = LoggerFactory.getLogger(UserAccountCreationController.class);

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
  @PostMapping("/initialize-and-set-password")
  public String setPassword(HttpSession session) {
    // steps here:
    // strip important information out of the session (can probably do that here and have the rest of the password setting be done in a separate private method)
    // add authentication, in the form of getting the Okta token out of the HTTP session (or servlet? look at patient experience controller for example)
    // extract the password, run some preliminary checks on it, and either return an error or set the password in Okta
    return session.getId();
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
