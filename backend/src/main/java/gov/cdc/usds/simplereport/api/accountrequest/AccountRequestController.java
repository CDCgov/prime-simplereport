package gov.cdc.usds.simplereport.api.accountrequest;

import static gov.cdc.usds.simplereport.config.AuthorizationConfiguration.AUTHORIZER_BEAN;
import static gov.cdc.usds.simplereport.config.WebConfiguration.ACCOUNT_REQUEST;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.okta.sdk.resource.ResourceException;
import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.accountrequest.errors.AccountRequestFailureException;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.accountrequest.AccountRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.AccountResponse;
import gov.cdc.usds.simplereport.api.model.accountrequest.WaitlistRequest;
import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import gov.cdc.usds.simplereport.service.AddressValidationService;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.crm.CrmService;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.service.model.DeviceSpecimenTypeHolder;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import javax.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
public class AccountRequestController {
  private final OrganizationService _os;
  private final DeviceTypeService _dts;
  private final AddressValidationService _avs;
  private final ApiUserService _aus;
  private final EmailService _es;
  private final SendGridProperties sendGridProperties;
  private final CrmService _crm;
  private final ObjectMapper objectMapper;

  private static final Logger LOG = LoggerFactory.getLogger(AccountRequestController.class);

  public AccountRequestController(
      SendGridProperties sendGridProperties,
      OrganizationService os,
      DeviceTypeService dts,
      AddressValidationService avs,
      ApiUserService aus,
      EmailService es,
      CrmService crm) {
    this.sendGridProperties = sendGridProperties;
    this._os = os;
    this._dts = dts;
    this._avs = avs;
    this._aus = aus;
    this._es = es;
    this._crm = crm;
    this.objectMapper = new ObjectMapper();
  }

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
  public void submitWaitlistRequest(@Valid @RequestBody WaitlistRequest body) throws IOException {
    String subject = "New waitlist request";
    if (LOG.isInfoEnabled()) {
      LOG.info("Waitlist request submitted: {}", objectMapper.writeValueAsString(body));
    }
    _es.send(sendGridProperties.getWaitlistRecipient(), subject, body);
  }

  /**
   * Read the account request and generate an email body, then send with the emailService and create
   * org
   */
  @SuppressWarnings("checkstyle:illegalcatch")
  @PostMapping("")
  @Transactional(readOnly = false)
  public void submitAccountRequest(@Valid @RequestBody AccountRequest body) throws IOException {
    try {
      Map<String, String> reqVars = convertAccountRequestToMap(body);
      Organization org = checkAccountRequestAndCreateOrg(reqVars);

      /**
       * Note: we are sending the emails *after* creating the organization so the validation logic
       * in the organization creation process functions as a CAPTCHA. But we are sending the emails
       * *before* creating the user so that if sendgrid etc fails, we aren't left with an Okta
       * entity created for the user that can't be automatically rolled back. (When we add automatic
       * Okta rollback mechanisms down the road, this won't be an issue.)
       */
      // send summary email to SR support
      String subject = "New account request";
      _es.send(sendGridProperties.getAccountRequestRecipient(), subject, body);
      // send next-steps email to requester
      _es.sendWithProviderTemplate(body.getEmail(), EmailProviderTemplate.ACCOUNT_REQUEST);

      createAdminUser(org, reqVars);
      _crm.submitAccountRequestData(body);
    } catch (ResourceException e) {
      // The `ResourceException` is thrown when an account is requested with an existing org
      // name. This happens quite frequently and is expected behavior of the current form
      throw e;
    } catch (IOException | RuntimeException e) {
      throw new AccountRequestFailureException(e);
    }
  }

  /**
   * Account request for experian id verification workflow. It differs from v1 in that it will not
   * send email to the user or to our support staff and it returns the org external id
   */
  @SuppressWarnings("checkstyle:illegalcatch")
  @PostMapping("/organization-create")
  @Transactional(readOnly = false)
  public AccountResponse submitAccountRequestV2(@Valid @RequestBody AccountRequest body)
      throws IOException {
    try {
      Map<String, String> reqVars = convertAccountRequestToMap(body);
      Organization org = checkAccountRequestAndCreateOrg(reqVars);
      createAdminUser(org, reqVars);
      _crm.submitAccountRequestData(body);
      return new AccountResponse(org.getExternalId());
    } catch (ResourceException e) {
      // The `ResourceException` is thrown when an account is requested with an existing org
      // name. This happens quite frequently and is expected behavior of the current form
      throw e;
    } catch (IOException | RuntimeException e) {
      throw new AccountRequestFailureException(e);
    }
  }

  private Map<String, String> convertAccountRequestToMap(AccountRequest accountRequest)
      throws JsonProcessingException {
    if (LOG.isInfoEnabled()) {
      LOG.info("Account request submitted: {}", objectMapper.writeValueAsString(accountRequest));
    }

    return accountRequest.toTemplateVariables().entrySet().stream()
        .collect(
            HashMap::new,
            (m, e) -> m.put(e.getKey(), e.getValue() == null ? null : e.getValue().toString()),
            HashMap::putAll);
  }

  private Organization checkAccountRequestAndCreateOrg(Map<String, String> reqVars)
      throws IOException {

    // verify that the organization doesn't already exist
    Optional<Organization> potentialDuplicateOrg =
        _os.getOrganizationByName(reqVars.get("organizationName"));
    if (potentialDuplicateOrg.isPresent()) {
      throw new BadRequestException("Organization is a duplicate.");
    }

    List<DeviceType> devices = _dts.fetchDeviceTypes();
    Map<String, String> deviceNamesToIds =
        devices.stream()
            .collect(Collectors.toMap(d -> d.getName(), d -> d.getInternalId().toString()));
    Map<String, String> deviceModelsToIds =
        devices.stream()
            .collect(Collectors.toMap(d -> d.getModel(), d -> d.getInternalId().toString()));

    List<String> testingDevicesSubmitted =
        new ArrayList<>(Arrays.asList(reqVars.get("testingDevices").split(", ")));
    testingDevicesSubmitted.removeIf(d -> d.toLowerCase().startsWith("other"));
    List<String> unregisteredTestingDevices = new ArrayList<>();
    List<String> testingDeviceIds =
        testingDevicesSubmitted.stream()
            .map(
                d -> {
                  String deviceId =
                      Optional.ofNullable(deviceNamesToIds.get(d)).orElse(deviceModelsToIds.get(d));
                  if (deviceId == null) {
                    unregisteredTestingDevices.add(d);
                  }
                  return deviceId;
                })
            .collect(Collectors.toList());
    // Can't easily catch a thrown exception in a stream, so move the throw outside of the stream:
    if (!unregisteredTestingDevices.isEmpty()) {
      throw new IOException(
          String.format(
              "Submitted device=%s not registered in DB.",
              unregisteredTestingDevices.iterator().next()));
    }
    String defaultTestingDeviceId =
        Optional.ofNullable(deviceNamesToIds.get(reqVars.get("defaultTestingDevice")))
            .orElse(deviceModelsToIds.get(reqVars.get("defaultTestingDevice")));
    if (defaultTestingDeviceId == null) {
      throw new IOException(
          String.format(
              "Submitted default device=%s not registered in DB.",
              reqVars.get("defaultTestingDevice")));
    }
    DeviceSpecimenTypeHolder deviceSpecimenTypes =
        _dts.getTypesForFacility(defaultTestingDeviceId, testingDeviceIds);

    StreetAddress facilityAddress =
        _avs.getValidatedAddress(
            reqVars.get("streetAddress1"),
            reqVars.get("streetAddress2"),
            reqVars.get("city"),
            reqVars.get("state"),
            reqVars.get("zip"),
            _avs.FACILITY_DISPLAY_NAME);
    StreetAddress providerAddress =
        new StreetAddress(
            Translators.parseString(reqVars.get("opStreetAddress1")),
            Translators.parseString(reqVars.get("opStreetAddress2")),
            Translators.parseString(reqVars.get("opCity")),
            Translators.parseState(reqVars.get("opState")),
            Translators.parseString(reqVars.get("opZip")),
            Translators.parseString(reqVars.get("opCounty")));

    PersonName providerName =
        Translators.consolidateNameArguments(
            null, reqVars.get("opFirstName"), null, reqVars.get("opLastName"), null, true);

    String orgExternalId =
        String.format(
            "%s-%s-%s",
            reqVars.get("state"),
            reqVars.get("organizationName").replace(' ', '-').replace(':', '-'),
            UUID.randomUUID().toString());

    return _os.createOrganization(
        reqVars.get("organizationName"),
        Translators.parseOrganizationTypeFromName(reqVars.get("organizationType")),
        orgExternalId,
        reqVars.get("facilityName"),
        reqVars.get("cliaNumber"),
        facilityAddress,
        Translators.parsePhoneNumber(reqVars.get("facilityPhoneNumber")),
        null,
        deviceSpecimenTypes,
        providerName,
        providerAddress,
        Translators.parsePhoneNumber(reqVars.get("opPhoneNumber")),
        reqVars.get("npi"));
  }

  private void createAdminUser(Organization org, Map<String, String> reqVars) {
    PersonName adminName =
        Translators.consolidateNameArguments(
            null, reqVars.get("firstName"), null, reqVars.get("lastName"), null);
    _aus.createUser(reqVars.get("email"), adminName, org.getExternalId(), Role.ADMIN);
  }
}
