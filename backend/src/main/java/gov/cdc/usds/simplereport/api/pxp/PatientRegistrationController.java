package gov.cdc.usds.simplereport.api.pxp;

import gov.cdc.usds.simplereport.db.model.PatientRegistrationLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.PatientRegistration;
import gov.cdc.usds.simplereport.service.PatientRegistrationLinkService;
import gov.cdc.usds.simplereport.service.PersonService;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
@PreAuthorize("@patientRegistrationLinkService.flagRegistrationRequest()")
@PostAuthorize("@restAuditLogManager.logRestSuccess(#request, returnObject)")
@Validated
public class PatientRegistrationController {
  private static final Logger LOG = LoggerFactory.getLogger(PatientRegistrationController.class);

  private final PatientRegistrationLinkService _patientRegLinkService;
  private final PersonService _personService;
  private final CurrentPatientContextHolder _currentPatientContextHolder;

  public PatientRegistrationController(
      PersonService personService,
      PatientRegistrationLinkService patientRegistrationLinkService,
      CurrentPatientContextHolder currentPatientContextHolder) {
    _personService = personService;
    _patientRegLinkService = patientRegistrationLinkService;
    _currentPatientContextHolder = currentPatientContextHolder;
  }

  @PostMapping("")
  public void register(@RequestBody PatientRegistration body, HttpServletRequest request) {
    _currentPatientContextHolder.setPatientRegistrationRequest(true);

    PatientRegistrationLink registrationLink =
        _patientRegLinkService.getPatientRegistrationLink(body.getRegistrationLink());
    UUID facilityIdOrNull =
        registrationLink.getFacility() != null
            ? registrationLink.getFacility().getInternalId()
            : null;

    Person p =
        _personService.addPatient(
            registrationLink.getOrganization(),
            facilityIdOrNull,
            body.getLookupId(),
            body.getFirstName(),
            body.getMiddleName(),
            body.getLastName(),
            body.getSuffix(),
            body.getBirthDate(),
            body.getAddress(),
            body.getTelephone(),
            body.getRole(),
            body.getEmail(),
            body.getRace(),
            body.getEthnicity(),
            body.getTribalAffiliation(),
            body.getGender(),
            body.getResidentCongregateSetting(),
            body.getEmployedInHealthcare(),
            body.getPreferredLanguage());

    LOG.info("Patient {} self-registered from {}", p.getInternalId(), registrationLink.getLink());
  }

  @GetMapping("/entity-name")
  public String getEntityName(
      @RequestParam String patientRegistrationLink, HttpServletRequest request) {
    PatientRegistrationLink link =
        _patientRegLinkService.getPatientRegistrationLink(patientRegistrationLink);
    if (link.getFacility() != null) {
      return link.getFacility().getFacilityName();
    }
    return link.getOrganization().getOrganizationName();
  }
}
