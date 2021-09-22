package gov.cdc.usds.simplereport.api.accountrequest;

import static gov.cdc.usds.simplereport.config.AuthorizationConfiguration.AUTHORIZER_BEAN;
import static gov.cdc.usds.simplereport.config.WebConfiguration.ACCOUNT_REQUEST;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.okta.sdk.resource.ResourceException;
import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.accountrequest.errors.AccountRequestFailureException;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.accountrequest.AccountResponse;
import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.WaitlistRequest;
import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.email.EmailService;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import javax.annotation.PostConstruct;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.UnexpectedRollbackException;
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
public class AccountRequestController {
  private final OrganizationService _os;
  private final ApiUserService _aus;
  private final EmailService _es;
  private final SendGridProperties sendGridProperties;
  private final ObjectMapper objectMapper = new ObjectMapper();
  private final OktaRepository _oktaRepo;

  private static final Logger LOG = LoggerFactory.getLogger(AccountRequestController.class);

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<String> handleException(BadRequestException e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
  }

  @PostConstruct
  private void init() {
    LOG.info("Account request REST endpoint enabled");
  }

  /** Read the waitlist request and generate an email body, then send with the emailService */
  @PostMapping("/waitlist")
  public void submitWaitlistRequest(@Valid @RequestBody WaitlistRequest request)
      throws IOException {
    if (LOG.isInfoEnabled()) {
      LOG.info("Waitlist request submitted: {}", objectMapper.writeValueAsString(request));
    }
    String subject = "New waitlist request";
    _es.send(sendGridProperties.getWaitlistRecipient(), subject, request);
  }

  /** Organization Account request without facility for experian id verification workflow. */
  @SuppressWarnings("checkstyle:illegalcatch")
  @PostMapping("/organization-create-without-facility")
  @Transactional(readOnly = false)
  public AccountResponse submitOrganizationAccountRequest(
      @Valid @RequestBody OrganizationAccountRequest request) throws IOException {
    try {
      logOrganizationAccountRequest(request);
      Organization org = checkAccountRequestAndCreateOrg(request);
      createAdminUser(
          request.getFirstName(), request.getLastName(), request.getEmail(), org.getExternalId());
      return new AccountResponse(org.getExternalId());
    } catch (ResourceException e) {
      // The `ResourceException` is mostly thrown when a user requests an account with an email
      // address that's already in Okta, but can be thrown for other Okta internal errors as well.
      // We rethrow it as a BadRequestException so that users get a toast informing them of the
      // error.
      if (e.getMessage().contains("An object with this field already exists")) {
        throw new BadRequestException(
            "This email address is already associated with a SimpleReport user.");
      } else {
        throw new BadRequestException(
            "An unknown error occurred when creating this organization in Okta.");
      }
    } catch (BadRequestException e) {
      // Need to catch and re-throw these BadRequestExceptions or they get rethrown as
      // AccountRequestFailureExceptions
      throw e;
    } catch (UnexpectedRollbackException e) {
      // This `UnexpectedRollbackException` is thrown if a duplicate org somehow slips past our
      // checks and is attempted to be committed to the database.
      // We rethrow it as a BadRequestException so that users get a toast informing them of the
      // error.
      throw new BadRequestException("This organization has already registered with SimpleReport.");
    } catch (IOException | RuntimeException e) {
      throw new AccountRequestFailureException(e);
    }
  }

  private Organization checkAccountRequestAndCreateOrg(OrganizationAccountRequest request) {
    String parsedStateCode = Translators.parseState(request.getState());
    String organizationName =
        checkForDuplicateOrg(request.getName(), parsedStateCode, request.getEmail());
    String orgExternalId = createOrgExternalId(organizationName, parsedStateCode);
    String organizationType = Translators.parseOrganizationType(request.getType());
    return _os.createOrganization(organizationName, organizationType, orgExternalId);
  }

  private String checkForDuplicateOrg(String organizationName, String state, String email) {
    organizationName = Translators.parseString(organizationName);
    if (organizationName == null || "".equals(organizationName)) {
      throw new BadRequestException("The organization name is empty.");
    }
    organizationName = organizationName.replaceAll("\\s{2,}", " ");

    List<Organization> potentialDuplicates = _os.getOrganizationsByName(organizationName);
    if (potentialDuplicates.isEmpty()) {
      return organizationName;
    }

    if (potentialDuplicates.stream().anyMatch(o -> o.getExternalId().startsWith(state))) {
      Optional<Organization> duplicateOrg =
          potentialDuplicates.stream().filter(o -> o.getExternalId().startsWith(state)).findFirst();
      if (duplicateOrg.isPresent()
          // Special toasts are shown to admin users trying to re-register their org.
          && (_oktaRepo.fetchAdminUserEmail(duplicateOrg.get()).equals(email))) {
        String message =
            duplicateOrg.get().getIdentityVerified()
                ? "Duplicate organization with admin user who has completed identity verification."
                : "Duplicate organization with admin user that has not completed identity verification.";
        throw new BadRequestException(message);
      }
      throw new BadRequestException("This organization has already registered with SimpleReport.");
    }

    return String.join("-", organizationName, state);
  }

  private String createOrgExternalId(String organizationName, String state) {
    return String.format(
        "%s-%s-%s",
        state, organizationName.replace(' ', '-').replace(':', '-'), UUID.randomUUID().toString());
  }

  private void createAdminUser(String firstName, String lastName, String email, String externalId) {
    PersonName adminName =
        Translators.consolidateNameArguments(null, firstName, null, lastName, null);
    _aus.createUser(email, adminName, externalId, Role.ADMIN);
  }

  private void logOrganizationAccountRequest(@RequestBody @Valid OrganizationAccountRequest request)
      throws JsonProcessingException {
    if (LOG.isInfoEnabled()) {
      LOG.info("Account request submitted: {}", objectMapper.writeValueAsString(request));
    }
  }
}
