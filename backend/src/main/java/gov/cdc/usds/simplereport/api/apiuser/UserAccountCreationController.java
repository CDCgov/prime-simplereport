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
    // strip important information out of the session (can probably do that here and have the rest
    // of the password setting be done in a separate private method)
    // add authentication, in the form of getting the Okta token out of the HTTP session (or
    // servlet? look at patient experience controller for example)
    // extract the password, run some preliminary checks on it, and either return an error or set
    // the password in Okta
    setPassword("hello", "world");
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

  private void setPassword(String authenticationToken, String password) {
    // it looks like interacting with the Okta API means making Post requests to them
    // making a request with an auth token that hasn't set their password yet will trigger the
    // setPassword flow on the okta side (the response will be different)
    // woot woooooot they have a Java SDK that we should be able to use instead of the POST methods
    // directly to their API
    // this will likely require changes to LiveOktaRepository and OktaRepository
    // one thing that's slightly unclear is where the changePasswordRequest will be set - the client
    // doesn't seem to have native methods for it?
    // two options are seemingly available: use the SDK to call a ChangePasswordRequest, or make a
    // direct request to Okta
    // AHA! Ok, to update:
    // it is possible (and probably easier) to use the API directly with a REST call, using
    // RestTemplate (already in use elsewhere in the app for DataHubUpload)
    // however, we are going to be mostly using the Authentication SDK later on, as we continue
    // customizing the login
    // therefore, probably better/easier to just start using the SDK now.

    // Plan is as follows:
    // Somehow install the Authentication SDK (should be able to mostly follow the example of the
    // existing Management SDK; a lot of the values that need to be set in yaml files should already
    // be there)
    // once the SDK is up and running, probably want to mimic the OktaRepository flow (could even
    // just include the new SDK in that same file, and add all the helper methods there)
    // one of the methods in that file should be "setupPassword(authenticationToken, password)"
    // which will in turn call resetPassword from the SDK
    // same flow for setting the recovery questions

    // the gradle file and yaml files should be appropriately configured already, thanks to our
    // usage of the Management API
  }
}
