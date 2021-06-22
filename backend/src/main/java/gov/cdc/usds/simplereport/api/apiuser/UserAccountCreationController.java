package gov.cdc.usds.simplereport.api.apiuser;

import static gov.cdc.usds.simplereport.config.WebConfiguration.USER_ACCOUNT_REQUEST;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.smartystreets.api.exceptions.BadRequestException;
import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.ActivateSecurityKeyRequest;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.EnrollMfaRequest;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.FactorAndQrCode;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.RequestConstants;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.SetRecoveryQuestionRequest;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.UserAccountCreationRequest;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.UserAccountStatus;
import gov.cdc.usds.simplereport.idp.authentication.OktaAuthentication;
import javax.annotation.Nullable;
import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;

/** Controller used for user account creation. */
@RestController
@RequestMapping(USER_ACCOUNT_REQUEST)
public class UserAccountCreationController {
  private static final Logger LOG = LoggerFactory.getLogger(UserAccountCreationController.class);

  private static final String USER_ID_KEY = "userId";
  private static final String FACTOR_ID_KEY = "factorId";

  @Autowired private OktaAuthentication _oktaAuth;

  @PostConstruct
  private void init() {
    LOG.info("User account request creation REST endpoint enabled.");
  }

  @GetMapping("/user-status")
  public UserAccountStatus getUserStatus(
      @RequestBody @Nullable String activationToken,
      @Nullable @SessionAttribute String userId,
      @Nullable @SessionAttribute String factorId) {
    return _oktaAuth.getUserStatus(activationToken, userId, factorId);
  }

  /**
   * Validates that the requesting user has been sent an invitation to SimpleReport, ensures the
   * given password meets all requirements, and sets the password in Okta.
   *
   * @param requestBody contains the password
   * @param request contains all header information, including the activation token.
   * @throws InvalidActivationLinkException if the activation token is invalid.
   * @throws OktaAuthenticationFailureException if the user is not in a RESET_PASSWORD state.
   * @throws BadRequestException if the password doesn't meet requirements.
   */
  @PostMapping("/initialize-and-set-password")
  public UserAccountStatus activateAccountAndSetPassword(
      @RequestBody UserAccountCreationRequest requestBody, HttpServletRequest request)
      throws InvalidActivationLinkException, OktaAuthenticationFailureException,
          BadRequestException {
    // If there's already a user session on the page, we can't reuse the activation token.
    // We assume the user hit the back button and it's a no-op.
    if (request.getSession().getAttribute(USER_ID_KEY) != null) {
      // no-op
      return UserAccountStatus.SET_SECURITY_QUESTIONS;
    }
    String userId =
        _oktaAuth.activateUser(
            requestBody.getActivationToken(),
            request.getHeader("X-Forwarded-For"),
            request.getHeader("User-Agent"));
    if (userId.isEmpty()) {
      throw new OktaAuthenticationFailureException("Returned user id is empty.");
    }
    request.getSession().setAttribute(USER_ID_KEY, userId);
    _oktaAuth.setPassword(userId, requestBody.getPassword().toCharArray());
    return UserAccountStatus.SET_SECURITY_QUESTIONS;
  }

  /**
   * Set's a user's password, assuming they've already been activated using the activation token.
   *
   * @param password the user-entered password
   * @param userId their Okta ID
   * @throws OktaAuthenticationFailureException if the user id isn't recognized in Okta
   * @throws BadRequestException if the password doesn't meet requirements
   */
  @PostMapping("/set-password")
  public void setPassword(@RequestBody String password, @SessionAttribute String userId)
      throws OktaAuthenticationFailureException, BadRequestException {
    _oktaAuth.setPassword(userId, password.toCharArray());
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
      @RequestBody SetRecoveryQuestionRequest requestBody, @SessionAttribute String userId)
      throws OktaAuthenticationFailureException {
    _oktaAuth.setRecoveryQuestion(userId, requestBody.getQuestion(), requestBody.getAnswer());
  }

  /**
   * Enrolls a user in SMS MFA.
   *
   * @param requestBody contains the user-provided phone number.
   * @param request contains session information about the user, including their Okta id.
   * @throws OktaAuthenticationFailureException if the provided phone number is invalid.
   */
  @PostMapping("/enroll-sms-mfa")
  public void enrollSmsMfa(
      @RequestBody @NotNull @Size(max = RequestConstants.STANDARD_REQUEST_STRING_LIMIT)
          String userInput,
      @SessionAttribute String userId,
      HttpServletRequest request)
      throws OktaAuthenticationFailureException {
    LOG.info("in enroll sms mfa");
    LOG.info("userInput: " + userInput);
    String factorId = _oktaAuth.enrollSmsMfa(userId, userInput);
    request.getSession().setAttribute(FACTOR_ID_KEY, factorId);
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
      @RequestBody EnrollMfaRequest requestBody,
      @SessionAttribute String userId,
      HttpServletRequest request)
      throws OktaAuthenticationFailureException {
    String factorId = _oktaAuth.enrollVoiceCallMfa(userId, requestBody.getUserInput());
    request.getSession().setAttribute(FACTOR_ID_KEY, factorId);
  }

  /**
   * Enrolls a user in email MFA, using the account email address stored in Okta.
   *
   * @param request contains session information about the user, including their Okta id.
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
   * @param request contains session information about the user, including their Okta id.
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
   * @param request contains session information about the user, including their Okta id.
   * @return activation object with information to finish enrolling the security key, including a
   *     challenge and user id.
   * @throws OktaAuthenticationFailureException if the user is not recognized or Okta cannot enroll
   *     their security key.
   */
  @PostMapping("/enroll-security-key-mfa")
  public JsonNode enrollSecurityKeyMfa(@SessionAttribute String userId, HttpServletRequest request)
      throws OktaAuthenticationFailureException {
    JSONObject enrollResponse = _oktaAuth.enrollSecurityKey(userId);
    request.getSession().setAttribute(FACTOR_ID_KEY, enrollResponse.getString(FACTOR_ID_KEY));
    JsonNode node =
        JsonNodeFactory.instance
            .objectNode()
            .put("activation", enrollResponse.getJSONObject("activation").toString());
    return node;
  }

  /**
   * Activates a security key for the user.
   *
   * @param requestBody contains attestation and clientData, required to activate the key in Okta.
   * @param request contains session information about the user, including their Okta id and the
   *     factor id of the security key.
   * @throws OktaAuthenticationFailureException if the user is not recognized or Okta cannot
   *     activate the security key.
   */
  @PostMapping("/activate-security-key-mfa")
  public void activateSecurityKeyMfa(
      @RequestBody ActivateSecurityKeyRequest requestBody,
      @SessionAttribute String userId,
      @SessionAttribute String factorId)
      throws OktaAuthenticationFailureException {
    _oktaAuth.activateSecurityKey(
        userId, factorId, requestBody.getAttestation(), requestBody.getClientData());
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
      @RequestBody EnrollMfaRequest requestBody,
      @SessionAttribute String userId,
      @SessionAttribute String factorId) {
    _oktaAuth.verifyActivationPasscode(userId, factorId, requestBody.getUserInput());
  }

  /**
   * Resends the activation passcode sent to a user (required for MFA enrollment).
   *
   * @param request contains session information about the user, including their Okta id and factor
   *     id.
   * @throws OktaAuthenticationFailureException if the user/factor are not found on the request, or
   *     if the resend request fails.
   * @throws IllegalStateException if the request is made less than 30 seconds after the last
   *     request for an activation code.
   */
  @PostMapping("/resend-activation-passcode")
  public void resendActivationPasscode(
      @SessionAttribute String userId, @SessionAttribute String factorId) {
    _oktaAuth.resendActivationPasscode(userId, factorId);
  }
}
