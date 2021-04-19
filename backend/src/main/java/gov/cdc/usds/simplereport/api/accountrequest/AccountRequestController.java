package gov.cdc.usds.simplereport.api.accountrequest;

import static gov.cdc.usds.simplereport.config.WebConfiguration.ACCOUNT_REQUEST;

import com.fasterxml.jackson.databind.ObjectMapper;

import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.accountrequest.AccountRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.WaitlistRequest;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import gov.cdc.usds.simplereport.service.AddressValidationService;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.service.model.DeviceSpecimenTypeHolder;

import java.io.IOException;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Note that this controller is unauthorized. */
@RestController
@RequestMapping(ACCOUNT_REQUEST)
public class AccountRequestController {
  private final OrganizationService _os;
  private final DeviceTypeService _dts;
  private final AddressValidationService _avs;
  private final ApiUserService _aus;
  
  private static final Logger LOG = LoggerFactory.getLogger(AccountRequestController.class);

  SendGridProperties sendGridProperties;
  EmailService emailService;
  ObjectMapper objectMapper;

  public AccountRequestController(
      SendGridProperties sendGridProperties, EmailService emailService) {
    this.sendGridProperties = sendGridProperties;
    this.emailService = emailService;
    this.objectMapper = new ObjectMapper();
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
    emailService.send(sendGridProperties.getWaitlistRecipient(), subject, body);
  }

  /** Read the account request and generate an email body, then send with the emailService */
  @PostMapping("")
  public void submitAccountRequest(@Valid @RequestBody AccountRequest body) throws IOException {
    String subject = "New account request";
    if (LOG.isInfoEnabled()) {
      LOG.info("Account request submitted: {}", objectMapper.writeValueAsString(body));
    }
    emailService.send(sendGridProperties.getAccountRequestRecipient(), subject, body);
    emailService.send(
        body.getEmail(),
        "Next Steps for SimpleReport",
        "account-next-steps",
        "simplereport-site-onboarding-guide.pdf");
    
    DeviceSpecimenTypeHolder deviceSpecimenTypes =
        _dts.getTypesForFacility(defaultDeviceId, deviceIds);
    StreetAddress facilityAddress =
        _avs.getValidatedAddress(
            body.getMailingAddress1(), 
            body.getMailingAddress2(), 
            body.getdevic
            body.getCity(), 
            body.getState(), 
            body.getZip(), 
            _avs.FACILITY_DISPLAY_NAME);
    StreetAddress providerAddress =
        new StreetAddress(
            Translators.parseString(body.getOpMailingAddress1()),
            Translators.parseString(body.getOpMailingAddress2()),
            Translators.parseString(body.getOpCity()),
            Translators.parseState(body.getOpState()),
            Translators.parseString(body.getOpZip()),
            Translators.parseString(body.getOpCounty()));
    PersonName providerName = // SPECIAL CASE: MAY BE ALL NULLS/BLANKS
        Translators.consolidateNameArguments(
            null,
            body.getOpFirstName(),
            body.getOpMiddleName(),
            body.getOpLastName(),
            body.getOpSuffix(),
            true);
    PersonName adminName =
        Translators.consolidateNameArguments(
            null, body.getFirstName(), body.getMiddleName(), body.getLastName(), body.getSuffix());
    Organization org =
        _os.createOrganization(
            body.getOrganizationName(),
            body.getOrganizationExternalId(),
            body.getFacilityName(),
            body.getCliaNumber(),
            facilityAddress,
            Translators.parsePhoneNumber(phone),
            Translators.parseEmail(email),
            deviceSpecimenTypes,
            providerName,
            providerAddress,
            Translators.parsePhoneNumber(body.getOpPhoneNumber()),
            body.getNpi());
    _aus.createUser(body.getEmail(), adminName, body.getOrganizationExternalId(), Role.ADMIN, false);
  }
}
