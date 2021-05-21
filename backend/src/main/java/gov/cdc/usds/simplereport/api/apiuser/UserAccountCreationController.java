package gov.cdc.usds.simplereport.api.apiuser;

import static gov.cdc.usds.simplereport.config.WebConfiguration.USER_ACCOUNT_REQUEST;

import gov.cdc.usds.simplereport.api.model.useraccountcreation.EnrollMfaRequest;
import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

  /**
   * Enrolls a user in SMS MFA.
   *
   * @param requestBody contains the user-provided phone number.
   * @param request contains session information about the user, including their Okta id.
   * @throws OktaAuthenticationFailureException if the provided phone number is invalid.
   */
  @PostMapping("/enroll-sms-mfa")
  public void enrollSmsMfa(@RequestBody EnrollMfaRequest requestBody, HttpServletRequest request) {
    // WIP: doesn't interact with Okta yet.
  }

  /**
   * Enrolls a user in voice call MFA.
   *
   * @param requestBody contains the user-provided phone number.
   * @param request contains session information about the user, including their Okta id.
   * @throws OktaAuthenticationFailureException if the provided phone number is invalid.
   */
  @PostMapping("/enroll-voice-call-mfa")
  public void enrollVoiceCallMfa(
      @RequestBody EnrollMfaRequest requestBody, HttpServletRequest request) {
    // WIP: doesn't interact with Okta yet.
  }

  /**
   * Enrolls a user in email MFA.
   *
   * @param requestBody contains the user-provided email address.
   * @param request contains session information about the user, including their Okta id.
   * @throws OktaAuthenticationFailureException if the provided email address is invalid.
   */
  @PostMapping("/enroll-email-mfa")
  public void enrollEmailMfa(
      @RequestBody EnrollMfaRequest requestBody, HttpServletRequest request) {
    // WIP: doesn't interact with Okta yet.
  }

  /**
   * Begins the enrollment process for authenticator apps.
   *
   * @param requestBody contains the user-selected authentication app to use (for now, one of Google
   *     Authenticator or Okta Verify.)
   * @param request contains session information about the user, including their Okta id.
   * @throws OktaAuthenticationFailureException if Okta cannot enroll the user in MFA.
   */
  @GetMapping("/authenticator-qr")
  public void getAuthQrCode(@RequestBody EnrollMfaRequest requestBody, HttpServletRequest request) {
    // WIP: doesn't interact with Okta yet.
  }

  /**
   * Verifies the passcode sent to a user to complete the MFA enrollment process for SMS, voice
   * call, and authentication app MFA options.
   *
   * @param requestBody contains the user-input passcode to be verified.
   * @param request contains session information about the user, including their Okta id.
   * @throws OktaAuthenticationFailureException if the provided passcode does not match the passcode
   *     sent by Okta.
   */
  @PostMapping("/verify-activation-passcode")
  public void verifyActivationPasscode(
      @RequestBody EnrollMfaRequest requestBody, HttpServletRequest request) {
    // WIP: doesn't interact with Okta yet.
  }

  /**
   * Resends the activation passcode sent to a user (required for MFA enrollment).
   *
   * @param request contains session information about the user, including their Okta id.
   */
  @PostMapping("/resend-activation-passcode")
  public void resendActivationPasscode(HttpServletRequest request) {
    // WIP: doesn't interact with Okta yet.
  }
}
