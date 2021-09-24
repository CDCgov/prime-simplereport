package gov.cdc.usds.simplereport.api.accountrequest;

import static gov.cdc.usds.simplereport.config.AuthorizationConfiguration.AUTHORIZER_BEAN;
import static gov.cdc.usds.simplereport.config.WebConfiguration.IDENTITY_VERIFICATION;

import gov.cdc.usds.simplereport.api.model.accountrequest.AccountRequestOrganizationCreateTemplate;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationAnswersRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationAnswersResponse;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationQuestionsRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationQuestionsResponse;
import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.service.errors.ExperianGetQuestionsException;
import gov.cdc.usds.simplereport.service.errors.ExperianKbaResultException;
import gov.cdc.usds.simplereport.service.errors.ExperianNullNodeException;
import gov.cdc.usds.simplereport.service.errors.ExperianPersonMatchException;
import gov.cdc.usds.simplereport.service.errors.ExperianSubmitAnswersException;
import gov.cdc.usds.simplereport.service.idverification.ExperianService;
import java.io.IOException;
import java.util.Set;
import javax.annotation.PostConstruct;
import javax.validation.Valid;
import lombok.extern.slf4j.Slf4j;
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
  @Autowired private OktaRepository _oktaRepo;
  @Autowired private OrganizationService _orgService;
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

  @ExceptionHandler(IllegalGraphqlArgumentException.class)
  public ResponseEntity<String> handleException(IllegalGraphqlArgumentException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
  }

  @PostMapping("/get-questions")
  public IdentityVerificationQuestionsResponse getQuestions(
      @Valid @RequestBody IdentityVerificationQuestionsRequest requestBody) throws IOException {
    Organization org = _orgService.getOrganization(requestBody.getOrgExternalId());
    String orgAdminEmail = checkOrgAndGetAdminEmail(org);

    try {
      return _experianService.getQuestions(requestBody);
    } catch (ExperianPersonMatchException
        | ExperianGetQuestionsException
        | ExperianNullNodeException e) {
      // could not match a person with the details in the request or general experian error
      sendIdentityVerificationFailedEmails(org.getExternalId(), orgAdminEmail);
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
    Organization org = _orgService.getOrganization(requestBody.getOrgExternalId());
    String orgAdminEmail = checkOrgAndGetAdminEmail(org);

    try {
      IdentityVerificationAnswersResponse verificationResponse =
          _experianService.submitAnswers(requestBody);

      verificationResponse.setEmail(orgAdminEmail);

      if (verificationResponse.isPassed()) {
        // enable the organization and send account activation email (through okta)
        String activationToken =
            _orgService.verifyOrganizationNoPermissions(requestBody.getOrgExternalId());
        verificationResponse.setActivationToken(activationToken);
      } else {
        sendIdentityVerificationFailedEmails(org.getExternalId(), orgAdminEmail);
      }

      return verificationResponse;
    } catch (ExperianSubmitAnswersException | ExperianNullNodeException e) {
      // a general error with experian occurred
      sendIdentityVerificationFailedEmails(org.getExternalId(), orgAdminEmail);
      throw e;
    }
  }

  private String checkOrgAndGetAdminEmail(Organization org) {
    Set<String> orgUserEmailSet = _oktaRepo.getAllUsersForOrganization(org);
    if (org.getIdentityVerified() || orgUserEmailSet.size() != 1) {
      throw new BadRequestException("The organization must be unverified and only have 1 member");
    }
    return orgUserEmailSet.iterator().next();
  }

  private void sendIdentityVerificationFailedEmails(String orgExternalId, String orgAdminEmail)
      throws IOException {
    // send summary email to SR support
    _es.send(
        sendGridProperties.getAccountRequestRecipient(),
        "New account ID verification failure",
        new AccountRequestOrganizationCreateTemplate(orgExternalId, orgAdminEmail));
    // send next-steps email to requester
    _es.sendWithProviderTemplate(orgAdminEmail, EmailProviderTemplate.ID_VERIFICATION_FAILED);
  }
}
