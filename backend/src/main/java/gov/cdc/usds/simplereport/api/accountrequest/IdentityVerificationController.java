package gov.cdc.usds.simplereport.api.accountrequest;

import static gov.cdc.usds.simplereport.config.AuthorizationConfiguration.AUTHORIZER_BEAN;
import static gov.cdc.usds.simplereport.config.WebConfiguration.IDENTITY_VERIFICATION;

import gov.cdc.usds.simplereport.api.accountrequest.errors.AccountRequestFailureException;
import gov.cdc.usds.simplereport.api.model.accountrequest.AccountRequestOrganizationCreateTemplate;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationAnswersRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationAnswersResponse;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationQuestionsRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationQuestionsResponse;
import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.service.errors.ExperianAuthException;
import gov.cdc.usds.simplereport.service.errors.ExperianGetQuestionsException;
import gov.cdc.usds.simplereport.service.errors.ExperianKbaResultException;
import gov.cdc.usds.simplereport.service.errors.ExperianNullNodeException;
import gov.cdc.usds.simplereport.service.errors.ExperianPersonMatchException;
import gov.cdc.usds.simplereport.service.errors.ExperianSubmitAnswersException;
import gov.cdc.usds.simplereport.service.idverification.ExperianService;
import java.io.IOException;
import java.util.Optional;
import javax.annotation.PostConstruct;
import javax.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.openapitools.client.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller used for identity verification via Experian. Note that this controller is
 * automatically authorized.
 */
@PreAuthorize("@" + AUTHORIZER_BEAN + ".permitAllAccountRequests()")
@RestController
@RequestMapping(IDENTITY_VERIFICATION)
@Slf4j
public class IdentityVerificationController {

  @Autowired private EmailService _es;
  @Autowired private ExperianService _experianService;
  @Autowired private OrganizationQueueService _orgQueueService;
  @Autowired private SendGridProperties sendGridProperties;

  @PostConstruct
  private void init() {
    log.info("Identity verification REST endpoint enabled.");
  }

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<String> handleException(BadRequestException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
  }

  @ExceptionHandler(ExperianPersonMatchException.class)
  public ResponseEntity<String> handleException(ExperianPersonMatchException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
  }

  @ExceptionHandler(ExperianGetQuestionsException.class)
  public ResponseEntity<String> handleException(ExperianGetQuestionsException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
  }

  @ExceptionHandler(ExperianSubmitAnswersException.class)
  public ResponseEntity<String> handleException(ExperianSubmitAnswersException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
  }

  @ExceptionHandler(ExperianKbaResultException.class)
  public ResponseEntity<String> handleException(ExperianKbaResultException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
  }

  @ExceptionHandler(ExperianNullNodeException.class)
  public ResponseEntity<String> handleException(ExperianNullNodeException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
  }

  @ExceptionHandler(ExperianAuthException.class)
  public ResponseEntity<String> handleException(ExperianAuthException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<String> handleException(IllegalArgumentException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
  }

  @PostMapping("/get-questions")
  public IdentityVerificationQuestionsResponse getQuestions(
      @Valid @RequestBody IdentityVerificationQuestionsRequest requestBody) throws IOException {
    Optional<OrganizationQueueItem> optItem =
        _orgQueueService.getUnverifiedQueuedOrganizationByExternalId(
            requestBody.getOrgExternalId());
    if (optItem.isEmpty()) {
      // throw same error that organizationService.getOrganization does
      throw new IllegalGraphqlArgumentException(
          "An organization with external_id=" + requestBody.getOrgExternalId() + " does not exist");
    }

    try {
      return _experianService.getQuestions(requestBody);
    } catch (ExperianAuthException
        | ExperianPersonMatchException
        | ExperianGetQuestionsException
        | ExperianNullNodeException e) {
      // could not match a person with the details in the request or general experian error
      OrganizationQueueItem queueItem = optItem.get();
      sendIdentityVerificationFailedEmails(
          queueItem.getExternalId(), queueItem.getRequestData().getEmail());
      throw e;
    }
  }

  @PostMapping("/submit-answers")
  public IdentityVerificationAnswersResponse submitAnswers(
      @Valid @RequestBody IdentityVerificationAnswersRequest requestBody) throws IOException {
    /**
     * example request body: {"answers":["1","2","3","4","5"]} where "1" represents the user
     * selecting "2002" for "Please select the model year of the vehicle you purchased or leased
     * prior to January 2011"
     */
    Optional<OrganizationQueueItem> optItem =
        _orgQueueService.getUnverifiedQueuedOrganizationByExternalId(
            requestBody.getOrgExternalId());
    if (optItem.isEmpty()) {
      // throw same error that organizationService.getOrganization does
      throw new IllegalGraphqlArgumentException(
          "An organization with external_id=" + requestBody.getOrgExternalId() + " does not exist");
    }

    return checkAnswersAndCreateQueuedOrganization(requestBody, optItem.get());
  }

  private IdentityVerificationAnswersResponse checkAnswersAndCreateQueuedOrganization(
      IdentityVerificationAnswersRequest requestBody, OrganizationQueueItem orgQueueItem)
      throws IOException {
    String orgAdminEmail = orgQueueItem.getRequestData().getEmail();

    try {
      IdentityVerificationAnswersResponse verificationResponse =
          _experianService.submitAnswers(requestBody);

      verificationResponse.setEmail(orgAdminEmail);

      if (verificationResponse.isPassed()) {
        // create and id verify the organization; create and activate admin user account
        String activationToken = _orgQueueService.createAndActivateQueuedOrganization(orgQueueItem);
        verificationResponse.setActivationToken(activationToken);
      } else {
        sendIdentityVerificationFailedEmails(orgQueueItem.getExternalId(), orgAdminEmail);
      }

      return verificationResponse;
    } catch (ApiException e) {
      // The `ApiException` is mostly thrown when a user requests an account with an email
      // address that's already in Okta, but can be thrown for other Okta internal errors as well.
      // Since there is no way for the user to fix the problem and resubmit, rethrow these as
      // AccountRequestExceptions so we get paged.
      throw new AccountRequestFailureException(e);
    } catch (ExperianAuthException | ExperianSubmitAnswersException | ExperianNullNodeException e) {
      // a general error with experian occurred
      sendIdentityVerificationFailedEmails(orgQueueItem.getExternalId(), orgAdminEmail);
      throw e;
    }
  }

  private void sendIdentityVerificationFailedEmails(String orgExternalId, String orgAdminEmail)
      throws IOException {
    // send summary email to SR support
    _es.send(
        sendGridProperties.getAccountRequestRecipient(),
        "New account ID verification failure",
        new AccountRequestOrganizationCreateTemplate(orgExternalId, orgAdminEmail));
    // send next-steps email to requester
    _es.sendWithDynamicTemplate(orgAdminEmail, EmailProviderTemplate.ID_VERIFICATION_FAILED);
  }
}
