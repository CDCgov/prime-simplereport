package gov.cdc.usds.simplereport.api.pxp;

import static gov.cdc.usds.simplereport.api.Translators.parseEmails;
import static gov.cdc.usds.simplereport.api.Translators.parseEthnicity;
import static gov.cdc.usds.simplereport.api.Translators.parseGender;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumbers;
import static gov.cdc.usds.simplereport.api.Translators.parseRace;
import static gov.cdc.usds.simplereport.api.Translators.parseString;

import gov.cdc.usds.simplereport.api.model.PersonUpdate;
import gov.cdc.usds.simplereport.api.model.errors.ExpiredPatientLinkException;
import gov.cdc.usds.simplereport.api.model.pxp.PxpRequestWrapper;
import gov.cdc.usds.simplereport.api.model.pxp.PxpTestResultUnauthenticatedResponse;
import gov.cdc.usds.simplereport.api.model.pxp.PxpVerifyResponse;
import gov.cdc.usds.simplereport.api.model.pxp.PxpVerifyResponseV2;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.OrderStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.TestEventService;
import gov.cdc.usds.simplereport.service.TimeOfConsentService;
import gov.cdc.usds.simplereport.service.model.PatientEmailsHolder;
import java.util.UUID;
import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
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

/**
 * Note that this controller self-authorizes by means of this {@link PreAuthorize} annotation and
 * its routes are set to permitAll() in SecurityConfiguration. If this changes, please update the
 * documentation on both sides.
 *
 * <p>Similarly, this controller sends information to the audit log via a {@link PostAuthorize}.
 * Because of this, every handler method of this controller is required to have an {@link
 * HttpServletRequest} argument named {@code request}.
 */
@PostAuthorize("@restAuditLogManager.logRestSuccess(#request, returnObject)")
@RestController
@RequestMapping("/pxp")
@Validated
@Slf4j
public class PatientExperienceController {
  private final PersonService _ps;
  private final PatientLinkService _pls;
  private final TestEventService _tes;
  private final TimeOfConsentService _tocs;
  private final CurrentPatientContextHolder _contextHolder;

  public PatientExperienceController(
      PersonService personService,
      PatientLinkService patientLinkService,
      TestEventService testEventService,
      TimeOfConsentService timeOfConsentService,
      CurrentPatientContextHolder contextHolder) {
    this._ps = personService;
    this._pls = patientLinkService;
    this._tes = testEventService;
    this._tocs = timeOfConsentService;
    this._contextHolder = contextHolder;
  }

  @PostConstruct
  private void init() {
    log.info("Patient Experience REST endpoints enabled");
  }

  /** Verify that the patient-provided DOB matches the patient on file for the patient link id. */
  @PreAuthorize(
      "@patientLinkService.verifyPatientLink(#body.getPatientLinkId(), #body.getDateOfBirth())")
  @PostMapping("/link/verify/v2")
  public PxpVerifyResponseV2 getPatientLinkVerifyV2(
      @RequestBody PxpRequestWrapper<Void> body, HttpServletRequest request) {
    Person patient = _contextHolder.getPatient();
    TestEvent testEvent = _contextHolder.getLinkedOrder().getTestEvent();
    _tocs.storeTimeOfConsent(_contextHolder.getPatientLink());

    return new PxpVerifyResponseV2(patient, testEvent);
  }

  /**
   * Given a patient link ID, returns the name of the patient for whom the test was conducted, in
   * lightly-obfuscated form (e.g. "John Doe" -> "John D").
   *
   * <p>This endpoint is unauthorized and therefore does not return fully identifying data.
   *
   * @param request
   * @return an obfuscated patient name
   */
  @GetMapping("/patient-name")
  public String getObfuscatedPatientNameFromLink(
      @RequestParam("patientLink") UUID patientLink, HttpServletRequest request)
      throws ExpiredPatientLinkException {
    var link = _pls.getPatientLink(patientLink);

    if (link.isExpired()) {
      throw new ExpiredPatientLinkException();
    }

    TestOrder to = link.getTestOrder();
    Person p = to.getPatient();

    _contextHolder.setContext(link, to, p);

    return p.getFirstName() + " " + p.getLastName().charAt(0) + ".";
  }

  /**
   * Given a patient link ID, returns a minimum of information about the patient (obfuscated name)
   * and facility (name and phone number) that may aid the end user in identify verification.
   *
   * <p>This endpoint is unauthorized and therefore does not return fully identifying data.
   */
  @GetMapping("/entity")
  public PxpTestResultUnauthenticatedResponse getTestResultUnauthenticated(
      @RequestParam("patientLink") UUID patientLink, HttpServletRequest request)
      throws ExpiredPatientLinkException {
    var link = _pls.getPatientLink(patientLink);

    if (link.isExpired()) {
      throw new ExpiredPatientLinkException();
    }

    TestOrder to = link.getTestOrder();
    Person p = to.getPatient();
    Facility f = to.getFacility();

    _contextHolder.setContext(link, to, p);

    return new PxpTestResultUnauthenticatedResponse(p, f, link);
  }

  @PostMapping("/patient")
  @PreAuthorize(
      "@patientLinkService.verifyPatientLink(#body.getPatientLinkId(), #body.getDateOfBirth())")
  public PxpVerifyResponse updatePatient(
      @RequestBody PxpRequestWrapper<PersonUpdate> body, HttpServletRequest request) {
    PersonUpdate person = body.getData();

    var backwardsCompatibleEmails = new PatientEmailsHolder(person.getEmail(), person.getEmails());

    Person updated =
        _ps.updateMe(
            StreetAddress.deAndReSerializeForSafety(person.getAddress()),
            parseString(person.getCountry()),
            parsePhoneNumbers(person.getPhoneNumbers()),
            person.getRole(),
            parseEmails(backwardsCompatibleEmails.getFullList()),
            parseRace(person.getRace()),
            parseEthnicity(person.getEthnicity()),
            person.getTribalAffiliation(),
            parseGender(person.getGender()),
            person.getResidentCongregateSetting(),
            person.getEmployedInHealthcare(),
            person.getPreferredLanguage());

    UUID plid = UUID.fromString(body.getPatientLinkId());
    PatientLink pl = _pls.getPatientLink(plid);
    OrderStatus os = pl.getTestOrder().getOrderStatus();
    TestEvent te = _tes.getLastTestResultsForPatient(updated);
    return new PxpVerifyResponse(updated, os, te);
  }
}
