package gov.cdc.usds.simplereport.idp.authentication;

import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.FactorAndQrCode;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.UserAccountStatus;
import org.json.JSONObject;

/**
 * Created by emmastephenson on 4/28/21
 *
 * <p>Handles all Okta-related authenticaton.
 */
public interface OktaAuthentication {

  /**
   * Returns a user's status, using both Okta state information and our own understanding. (State
   * here do not correspond exactly to Okta state, since we care about things like the state of
   * factor activation.)
   *
   * @param activationToken nullable, the activation token associated with the user.
   * @param userId nullable, a user's Okta id.
   * @param factorId nullable, a user's Okta factor id.
   * @return a UserAccountStatus enum.
   */
  public UserAccountStatus getUserStatus(String activationToken, String userId, String factorId);

  /**
   * Converts an activation token into a user id. If successful, the user is moved into a
   * RESET_PASSWORD state.
   *
   * @param activationToken the provided activation token (usually contained in the activation email
   *     sent to users.)
   * @param crossForwardedHeader the user's header to forward the request (required by Okta.)
   * @param userAgent the user's agent (browser) required by Okta to forward the request.
   * @return the Okta user id.
   * @throws InvalidActivationLinkException if the activation token is invalid, expired, or has
   *     already been used.
   */
  public String activateUser(String activationToken, String crossForwardedHeader, String userAgent)
      throws InvalidActivationLinkException;

  /**
   * Sets the user's password.
   *
   * @param userId the user id of the user making the request.
   * @param password the user-provided password.
   * @throws OktaAuthenticationFailureException if Okta fails to set the password (i.e., if the user
   *     id is invalid.)
   * @throws BadRequestException if the user-provided password does not meet Okta requirements.
   */
  public void setPassword(String userId, char[] password)
      throws OktaAuthenticationFailureException, BadRequestException;

  /**
   * Sets the user's recovery questions.
   *
   * @param userId the user id of the user making the request.
   * @param question the user-selected question to answer.
   * @param answer the user-input answer to the selected question.
   * @throws BadRequestException if the recovery answer doesn't meet Okta requirements.
   * @throws OktaAuthenticationFailureException if setting the recovery question fails (i.e.,
   *     because the user isn't in the correct state or cannot be found).
   */
  public void setRecoveryQuestion(String userId, String question, String answer)
      throws OktaAuthenticationFailureException, BadRequestException;

  /**
   * Enroll a user in SMS MFA. If successful, this enrollment triggers a text to the user's phone
   * with an activation passcode.
   *
   * @param userId the user id of the user making the request.
   * @param phoneNumber the user-provided phone number to enroll.
   * @return factorId the Okta-generated id for the phone number factor.
   * @throws BadRequestException if the phone number is invalid.
   * @throws OktaAuthenticationFailureException if Okta cannot enroll the user in SMS MFA.
   */
  public String enrollSmsMfa(String userId, String phoneNumber)
      throws OktaAuthenticationFailureException, BadRequestException;

  /**
   * Enroll a user in voice call MFA. If successful, this enrollment triggers a phone call to the
   * user with an activation passcode.
   *
   * @param userId the user id of the user making the enrollment request.
   * @param phoneNumber the user-provided phone number to enroll.
   * @return factorId the Okta-generated id for the voice call factor.
   * @throws BadRequestException if the phone number is invalid.
   * @throws OktaAuthenticationFailureException if Okta cannot enroll the user in voice call MFA.
   */
  public String enrollVoiceCallMfa(String userId, String phoneNumber)
      throws OktaAuthenticationFailureException, BadRequestException;

  /**
   * Enroll a user in email MFA using their attached profile email. If successful, this enrollment
   * triggers an activation email to the user with an activation passcode.
   *
   * @param userId the user id of the user making the enrollment request.
   * @return factorId the Okta-generated id for the email factor.
   * @throws OktaAuthenticationFailureException if the email is invalid or Okta cannot enroll it as
   *     an MFA option.
   */
  public String enrollEmailMfa(String userId) throws OktaAuthenticationFailureException;

  /**
   * Enroll a user in an authentication app for MFA. If successful, this method returns the factor
   * id and a qr code. The qr code will be passed to the user for them to finish enrolling in-app.
   *
   * @param userId the user id of the user making the enrollment request.
   * @param appType the appType of the app being enrolled (for now, one of Okta Verify or Google
   *     Authenticator.)
   * @return the factor id and qr code.
   * @throws OktaAuthenticationFailureException if the app type is not recognized, Okta fails to
   *     enroll the MFA option, or the result from Okta does not contain a QR code.
   */
  public FactorAndQrCode enrollAuthenticatorAppMfa(String userId, String appType)
      throws OktaAuthenticationFailureException;

  /**
   * Enrolls a security key, returning an activation object that contains registration information
   * for the frontend.
   *
   * @param userId the user id of the user enrolling their security key.
   * @return a JSON representation of the activation object.
   * @throws OktaAuthenticationFailureException if the user id is not recognized or the factor
   *     cannot be enrolled.
   */
  public JSONObject enrollSecurityKey(String userId) throws OktaAuthenticationFailureException;

  /**
   * Activates a security key using the provided frontend-generated credentials.
   *
   * @param userId the user id of the user activating their security key.
   * @param factorId the factor id returned from security key enrollment
   * @param attestation the base64-encoded attestation from the WebAuthn JavaScript call
   * @param clientData the base64-encoded client data from the WebAuthn JavaScript call
   */
  public void activateSecurityKey(
      String userId, String factorId, String attestation, String clientData)
      throws OktaAuthenticationFailureException;

  /**
   * Activate MFA enrollment with a user-provided passcode. This method should be used for sms,
   * call, email, and authentication app MFA options.
   *
   * @param userId the user id of the user activating their MFA.
   * @param factorId the factor id of the factor being activated.
   * @param passcode the user-provided passcode to use for activation. This will have been sent to
   *     the user via SMS, voice call, etc.
   * @throws BadRequestException if the provided passcode does not match Okta records.
   * @throws OktaAuthenticationFailureException if the factor could not be activated (because the
   *     user or factor doesn't exist).
   */
  public void verifyActivationPasscode(String userId, String factorId, String passcode)
      throws OktaAuthenticationFailureException;

  /**
   * Triggers Okta to resend an activation passcode. Should only be used for SMS, call, and email
   * MFA options.
   *
   * <p>Note: this is not the same method that is used to send a challenge to the user; this is only
   * for when the user is in a kind of activation limbo (they've enrolled but the factor has not
   * been activated yet).
   *
   * @param userId the user id of the user requesting a resend.
   * @param factorId the factor id that we need to re-request a code from.
   * @throws OktaAuthenticationFailureException if the user or factor cannot be found.
   * @throws IllegalStateException if the resend request comes too soon (Okta enforces a minimum 30
   *     second pause between activation code requests.)
   */
  public void resendActivationPasscode(String userId, String factorId)
      throws OktaAuthenticationFailureException;
}
