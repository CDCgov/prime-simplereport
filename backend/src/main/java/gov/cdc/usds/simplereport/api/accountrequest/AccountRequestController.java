package gov.cdc.usds.simplereport.api.accountrequest;

import static gov.cdc.usds.simplereport.config.AuthorizationConfiguration.AUTHORIZER_BEAN;
import static gov.cdc.usds.simplereport.config.WebConfiguration.ACCOUNT_REQUEST;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.accountrequest.errors.AccountRequestFailureException;
import gov.cdc.usds.simplereport.api.model.accountrequest.AccountResponse;
import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.WaitlistRequest;
import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.utils.OrganizationUtils;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import javax.annotation.PostConstruct;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Note that this controller is automatically authorized. */
@PreAuthorize("@" + AUTHORIZER_BEAN + ".permitAllAccountRequests()")
@RestController
@RequestMapping(ACCOUNT_REQUEST)
@RequiredArgsConstructor
@Slf4j
public class AccountRequestController {
  private final OrganizationService _os;
  private final OrganizationQueueService _oqs;
  private final ApiUserService _aus;
  private final EmailService _es;
  private final SendGridProperties sendGridProperties;
  private final ObjectMapper objectMapper = new ObjectMapper();
  private final OktaRepository _oktaRepo;

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<String> handleException(BadRequestException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
  }

  @PostConstruct
  private void init() {
    log.info("Account request REST endpoint enabled");
  }

  /** Read the waitlist request and generate an email body, then send with the emailService */
  @PostMapping("/waitlist")
  public void submitWaitlistRequest(@Valid @RequestBody WaitlistRequest request)
      throws IOException {
    if (log.isInfoEnabled()) {
      log.info("Waitlist request submitted: {}", objectMapper.writeValueAsString(request));
    }
    String subject = "New waitlist request";
    _es.send(sendGridProperties.getWaitlistRecipient(), subject, request);
  }

  @SuppressWarnings("checkstyle:illegalcatch")
  @PostMapping("/organization-add-to-queue")
  @Transactional(readOnly = false)
  public AccountResponse submitOrganizationAccountRequestAddToQueue(
      @Valid @RequestBody OrganizationAccountRequest request) throws IOException {
    try {
      logOrganizationAccountRequest(request);

      String parsedStateCode = Translators.parseState(request.getState());
      String organizationName =
          checkForDuplicateOrg(request.getName(), parsedStateCode, request.getEmail());
      String orgExternalId =
          OrganizationUtils.generateOrgExternalId(organizationName, parsedStateCode);

      String requestEmail = Translators.parseEmail(request.getEmail());
      boolean userExists = _aus.userExists(requestEmail);
      if (userExists) {
        throw new BadRequestException(
            "This email address is already associated with a SimpleReport user.");
      }

      OrganizationQueueItem item = _oqs.queueNewRequest(organizationName, orgExternalId, request);

      return new AccountResponse(item.getExternalId());
    } catch (BadRequestException e) {
      // Need to catch and re-throw these BadRequestExceptions or they get rethrown as
      // AccountRequestFailureExceptions
      throw e;
    } catch (IllegalGraphqlArgumentException e) {
      throw new BadRequestException("Invalid email address");
    } catch (IOException | RuntimeException e) {
      throw new AccountRequestFailureException(e);
    }
  }

  private String checkForDuplicateOrg(String organizationName, String state, String email) {
    organizationName = Translators.parseString(organizationName);
    if (organizationName == null || "".equals(organizationName)) {
      throw new BadRequestException("The organization name is empty.");
    }
    organizationName = organizationName.replaceAll("\\s{2,}", " ");

    List<Organization> potentialDuplicates = _os.getOrganizationsByName(organizationName);
    // Not a duplicate org, can be safely created
    if (potentialDuplicates.isEmpty()) {
      return organizationName;
    }

    // Is the duplicate org in the same state? If so, it's a true duplicate
    if (potentialDuplicates.stream().anyMatch(o -> o.getExternalId().startsWith(state))) {
      Optional<Organization> duplicateOrg =
          potentialDuplicates.stream().filter(o -> o.getExternalId().startsWith(state)).findFirst();
      if (duplicateOrg.isPresent()) {
        if (_oktaRepo.fetchAdminUserEmail(duplicateOrg.get()).stream()
            .anyMatch(Predicate.isEqual(email))) {
          // Special toasts are shown to admin users trying to re-register their org.
          String message =
              duplicateOrg.get().getIdentityVerified()
                  ? "Duplicate organization with admin user who has completed identity verification."
                  : "Duplicate organization with admin user that has not completed identity verification.";
          throw new BadRequestException(message);
        } else {
          throw new BadRequestException(
              "This organization has already registered with SimpleReport.");
        }
      }
    }

    // Org can be created because it's not in the same state, but it gets a special org name to
    // distinguish it
    return String.join("-", organizationName, state);
  }

  private void logOrganizationAccountRequest(@RequestBody @Valid OrganizationAccountRequest request)
      throws JsonProcessingException {
    if (log.isInfoEnabled()) {
      log.info("Account request submitted: {}", objectMapper.writeValueAsString(request));
    }
  }
}
