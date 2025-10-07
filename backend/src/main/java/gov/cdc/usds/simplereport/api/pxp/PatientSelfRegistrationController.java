package gov.cdc.usds.simplereport.api.pxp;

import static gov.cdc.usds.simplereport.api.Translators.parseEmails;
import static gov.cdc.usds.simplereport.api.Translators.parseEthnicity;
import static gov.cdc.usds.simplereport.api.Translators.parseGender;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumbers;
import static gov.cdc.usds.simplereport.api.Translators.parseRace;
import static gov.cdc.usds.simplereport.api.Translators.parseString;
import static gov.cdc.usds.simplereport.api.Translators.parseTribalAffiliation;

import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.PatientSelfRegistration;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneNumberInput;
import gov.cdc.usds.simplereport.service.PatientSelfRegistrationLinkService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.model.ExistingPatientCheckRequestBody;
import gov.cdc.usds.simplereport.service.model.PatientEmailsHolder;
import java.util.List;
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pxp/register")
@PreAuthorize("@patientSelfRegistrationLinkService.flagSelfRegistrationRequest()")
@PostAuthorize("@restAuditLogManager.logRestSuccess(#request, returnObject)")
@Validated
@Slf4j
@RequiredArgsConstructor
public class PatientSelfRegistrationController {
  private final PatientSelfRegistrationLinkService _patientRegLinkService;
  private final PersonService _personService;
  private final CurrentPatientContextHolder _currentPatientContextHolder;

  @PostMapping("")
  public void register(@RequestBody PatientSelfRegistration body, HttpServletRequest request) {
    _currentPatientContextHolder.setIsPatientSelfRegistrationRequest(true);

    PatientSelfRegistrationLink registrationLink =
        _patientRegLinkService.getPatientRegistrationLink(parseString(body.getRegistrationLink()));

    List<PhoneNumberInput> backwardsCompatiblePhoneNumbers =
        body.getPhoneNumbers() != null
            ? body.getPhoneNumbers()
            : List.of(new PhoneNumberInput(null, parsePhoneNumber(body.getTelephone())));

    var backwardsCompatibleEmails = new PatientEmailsHolder(body.getEmail(), body.getEmails());

    Person p =
        _personService.addPatient(
            registrationLink,
            parseString(body.getLookupId()),
            parseString(body.getFirstName()),
            parseString(body.getMiddleName()),
            parseString(body.getLastName()),
            parseString(body.getSuffix()),
            body.getBirthDate(),
            body.getAddress(),
            body.getCountry(),
            parsePhoneNumbers(backwardsCompatiblePhoneNumbers),
            body.getRole(),
            parseEmails(backwardsCompatibleEmails.getFullList()),
            parseRace(body.getRace()),
            parseEthnicity(body.getEthnicity()),
            parseTribalAffiliation(body.getTribalAffiliation()),
            parseGender(body.getGender()),
            body.getResidentCongregateSetting(),
            body.getEmployedInHealthcare(),
            parseString(body.getPreferredLanguage()),
            body.getTestResultDelivery());

    log.info(
        "Patient={} self-registered from link={}", p.getInternalId(), registrationLink.getLink());
  }

  @PostMapping("/existing-patient")
  public boolean isExistingPatient(
      @RequestParam String patientRegistrationLink,
      @RequestBody ExistingPatientCheckRequestBody body,
      HttpServletRequest request) {
    PatientSelfRegistrationLink link =
        _patientRegLinkService.getPatientRegistrationLink(patientRegistrationLink);

    return _personService.isDuplicatePatient(
        body.getFirstName(),
        body.getLastName(),
        body.getBirthDate(),
        link.getOrganization(),
        Optional.ofNullable(link.getFacility()));
  }

  @GetMapping("/entity-name")
  public String getEntityName(
      @RequestParam String patientRegistrationLink, HttpServletRequest request) {
    PatientSelfRegistrationLink link =
        _patientRegLinkService.getPatientRegistrationLink(patientRegistrationLink);
    if (link.getFacility() != null) {
      return link.getFacility().getFacilityName();
    }
    return link.getOrganization().getOrganizationName();
  }
}
