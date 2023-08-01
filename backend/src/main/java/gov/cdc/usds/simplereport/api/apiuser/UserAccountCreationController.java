package gov.cdc.usds.simplereport.api.apiuser;

import static gov.cdc.usds.simplereport.config.WebConfiguration.USER_ACCOUNT_REQUEST;

import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.ActivateAccountRequest;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.ActivateSecurityKeyRequest;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.EnrollMfaRequest;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.FactorAndActivation;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.FactorAndQrCode;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.SetPasswordRequest;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.SetRecoveryQuestionRequest;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.UserAccountStatus;
import gov.cdc.usds.simplereport.idp.authentication.OktaAuthentication;
import javax.annotation.Nullable;
import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;

/**
 * Controller used for user account creation.
 *
 * <p>There's an implicit flow in this controller. The expectation is that the user is first
 * activated, then their password is set, then recovery questions, and finally they are enrolled in
 * and activate an MFA option. A sample endpoint flow is as follows: /initialize, /set-password,
 * /set-recovery-questions, /enroll-sms-mfa, /verify-activation-passcode.
 *
 * <p>Okta has an internal state machine that keeps track of the user's status, and will reject
 * requests if they're not the next step in the state. For example, attempting to enroll a user in
 * MFA before they've set their password will generate an Okta error, because the user is still in a
 * RESET_PASSWORD state.
 */
@RestController
@RequestMapping(USER_ACCOUNT_REQUEST)
@Slf4j
public class UserAccountCreationController {
  private static final String USER_ID_KEY = "userId";
  private static final String FACTOR_ID_KEY = "factorId";

  @Autowired private OktaAuthentication _oktaAuth;

  @PostConstruct
  private void init() {
    log.info("User account request creation REST endpoint enabled.");
  }

  @ExceptionHandler(InvalidActivationLinkException.class)
  public ResponseEntity<String> handleException(InvalidActivationLinkException e) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
  }

  @ExceptionHandler(OktaAuthenticationFailureException.class)
  public ResponseEntity<String> handleException(OktaAuthenticationFailureException e) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
  }

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<String> handleException(BadRequestException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
  }

  @ExceptionHandler(ServletRequestBindingException.class)
  public ResponseEntity<String> handleException(ServletRequestBindingException e) {
    return ResponseEntity.status(HttpStatus.GONE).body("Session timeout:" + e.getMessage());
  }

  /**
   * Fetches a user status's status within the account creation process. Does not exactly match the
   * Okta account status options, since we also want to know about states such as MFA enrollment.
   *
   * @param activationToken optional, the activationToken provided to a user
   * @param userId optional, the Okta user id on a given session
   * @param factorId optional, the Okta factor id on a given session
   * @return UserAccountStatus
   */
  @GetMapping("/user-status")
  public UserAccountStatus getUserStatus(
      @RequestParam @Nullable String activationToken,
      @Nullable @SessionAttribute String userId,
      @Nullable @SessionAttribute String factorId,
      HttpServletRequest request) {
    return _oktaAuth.getUserStatus(activationToken, userId, factorId);
  }

  @PostMapping("/initialize")
  public void activateAccount(
      @RequestBody ActivateAccountRequest requestBody, HttpServletRequest request)
      throws InvalidActivationLinkException {
    String userId =
        _oktaAuth.activateUser(
            requestBody.getActivationToken(),
            request.getHeader("X-Forwarded-For"),
            request.getHeader("User-Agent"));
    if (userId.isEmpty()) {
      throw new OktaAuthenticationFailureException("Returned user id is empty.");
    }
    request.getSession().setAttribute(USER_ID_KEY, userId);
  }

  /**
   * Set's a user's password, assuming they've already been activated using the activation token.
   *
   * @param requestBody contains the user-entered password
   * @param userId their Okta ID
   * @throws OktaAuthenticationFailureException if the user id isn't recognized in Okta
   * @throws BadRequestException if the password doesn't meet requirements
   */
  @PostMapping("/set-password")
  public void setPassword(
      @RequestBody SetPasswordRequest requestBody,
      @SessionAttribute String userId,
      HttpServletRequest request)
      throws OktaAuthenticationFailureException, BadRequestException {
    _oktaAuth.setPassword(userId, requestBody.getPassword().toCharArray());
  }

  /**
   * Sets a recovery question and answer for a user.
   *
   * @param requestBody contains the selected question and user-provided answer
   * @param userId the user's Okta id
   * @throws OktaAuthenticationFailureException if the recovery question or answer don't meet Okta
   *     standards (answers must be at least 4 chars long)
   */
  @PostMapping("/set-recovery-question")
  public void setRecoveryQuestions(
      @RequestBody SetRecoveryQuestionRequest requestBody,
      @SessionAttribute String userId,
      HttpServletRequest request)
      throws OktaAuthenticationFailureException, BadRequestException {
    _oktaAuth.setRecoveryQuestion(userId, requestBody.getQuestion(), requestBody.getAnswer());
  }

  /**
   * Enrolls a user in SMS MFA.
   *
   * @param requestBody contains the user-provided phone number.
   * @param userId the user's Okta id
   * @param request contains user's session information. Used to set factor id.
   * @throws OktaAuthenticationFailureException if the provided phone number is invalid.
   */
  @PostMapping("/enroll-sms-mfa")
  public void enrollSmsMfa(
      @RequestBody EnrollMfaRequest requestBody,
      @SessionAttribute String userId,
      HttpServletRequest request)
      throws OktaAuthenticationFailureException, BadRequestException {
    String factorId = _oktaAuth.enrollSmsMfa(userId, formatPhoneNumber(requestBody.getUserInput()));
    request.getSession().setAttribute(FACTOR_ID_KEY, factorId);
  }

  /**
   * Enrolls a user in voice call MFA.
   *
   * @param requestBody contains the user-provided phone number.
   * @param userId the user's Okta id
   * @param request contains user's session information. Used to set factor id.
   * @throws OktaAuthenticationFailureException if the provided phone number is invalid.
   */
  @PostMapping("/enroll-voice-call-mfa")
  public void enrollVoiceCallMfa(
      @RequestBody EnrollMfaRequest requestBody,
      @SessionAttribute String userId,
      HttpServletRequest request)
      throws OktaAuthenticationFailureException, BadRequestException {
    String factorId =
        _oktaAuth.enrollVoiceCallMfa(userId, formatPhoneNumber(requestBody.getUserInput()));
    request.getSession().setAttribute(FACTOR_ID_KEY, factorId);
  }

  /**
   * Enrolls a user in email MFA, using the account email address stored in Okta.
   *
   * @param userId the user's Okta id
   * @param request contains user's session information. Used to set factor id.
   * @throws OktaAuthenticationFailureException if the provided email address is invalid.
   */
  @PostMapping("/enroll-email-mfa")
  public void enrollEmailMfa(@SessionAttribute String userId, HttpServletRequest request)
      throws OktaAuthenticationFailureException {
    String factorId = _oktaAuth.enrollEmailMfa(userId);
    request.getSession().setAttribute(FACTOR_ID_KEY, factorId);
  }

  /**
   * Begins the enrollment process for authenticator apps.
   *
   * @param requestBody contains the user-selected authentication app to use (for now, one of Google
   *     Authenticator or Okta Verify.)
   * @param userId the user's Okta id
   * @param request contains user's session information. Used to set factor id.
   * @throws OktaAuthenticationFailureException if Okta cannot enroll the user in MFA.
   */
  @PostMapping("/authenticator-qr")
  public FactorAndQrCode getAuthQrCode(
      @RequestBody EnrollMfaRequest requestBody,
      @SessionAttribute String userId,
      HttpServletRequest request)
      throws OktaAuthenticationFailureException {
    FactorAndQrCode factorData =
        _oktaAuth.enrollAuthenticatorAppMfa(userId, requestBody.getUserInput());
    request.getSession().setAttribute(FACTOR_ID_KEY, factorData.getFactorId());
    return factorData;
  }

  /**
   * Enrolls a security key for the user, returning data needed to finish activation.
   *
   * @param userId the user's Okta id
   * @param request contains user's session information. Used to set factor id.
   * @return activation object with information to finish enrolling the security key, including a
   *     challenge and user id.
   * @throws OktaAuthenticationFailureException if the user is not recognized or Okta cannot enroll
   *     their security key.
   */
  @PostMapping("/enroll-security-key-mfa")
  public FactorAndActivation enrollSecurityKeyMfa(
      @SessionAttribute String userId, HttpServletRequest request)
      throws OktaAuthenticationFailureException {
    var enrollResponse = _oktaAuth.enrollSecurityKey(userId);
    request.getSession().setAttribute(FACTOR_ID_KEY, enrollResponse.getFactorId());
    return enrollResponse;
  }

  /**
   * Activates a security key for the user.
   *
   * @param requestBody contains attestation and clientData, required to activate the key in Okta.
   * @param userId the user's Okta id
   * @param factorId the factor id of the enrolled security key
   * @throws OktaAuthenticationFailureException if the user is not recognized or Okta cannot
   *     activate the security key.
   */
  @PostMapping("/activate-security-key-mfa")
  public void activateSecurityKeyMfa(
      @RequestBody @Valid ActivateSecurityKeyRequest requestBody,
      @SessionAttribute String userId,
      @SessionAttribute String factorId,
      HttpServletRequest request)
      throws OktaAuthenticationFailureException {
    _oktaAuth.activateSecurityKey(
        userId, factorId, requestBody.getAttestation(), requestBody.getClientData());
  }

  /**
   * Verifies the passcode sent to a user to complete the MFA enrollment process for SMS, voice
   * call, and authentication app MFA options.
   *
   * @param requestBody contains the user-input passcode to be verified.
   * @param userId the user's Okta id
   * @param factorId the Okta-provided factor id of the enrolled MFA option
   * @param request contains session information for the user.
   * @throws OktaAuthenticationFailureException if the provided passcode does not match the passcode
   *     sent by Okta.
   */
  @PostMapping("/verify-activation-passcode")
  public void verifyActivationPasscode(
      @RequestBody EnrollMfaRequest requestBody,
      @SessionAttribute String userId,
      @SessionAttribute String factorId,
      HttpServletRequest request) {
    _oktaAuth.verifyActivationPasscode(userId, factorId, requestBody.getUserInput());
  }

  /**
   * Resends the activation passcode sent to a user (required for MFA enrollment).
   *
   * @param userId the user's Okta id.
   * @param factorId the Okta-provided factor id of the enrolled MFA option.
   * @throws OktaAuthenticationFailureException if the user/factor are not found on the request, or
   *     if the resend request fails.
   * @throws IllegalStateException if the request is made less than 30 seconds after the last
   *     request for an activation code.
   */
  @PostMapping("/resend-activation-passcode")
  public void resendActivationPasscode(
      @SessionAttribute String userId,
      @SessionAttribute String factorId,
      HttpServletRequest request) {
    _oktaAuth.resendActivationPasscode(userId, factorId);
  }

  private String formatPhoneNumber(String userInput) throws BadRequestException {
    if (userInput == null) {
      throw new BadRequestException("Phone number cannot be null.");
    }
    return userInput.replaceAll("[^\\d.]", "");
  }
}
