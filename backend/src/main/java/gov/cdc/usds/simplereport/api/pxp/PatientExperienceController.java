package gov.cdc.usds.simplereport.api.pxp;

import static gov.cdc.usds.simplereport.api.Translators.parseEmail;
import static gov.cdc.usds.simplereport.api.Translators.parseEthnicity;
import static gov.cdc.usds.simplereport.api.Translators.parseGender;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumbers;
import static gov.cdc.usds.simplereport.api.Translators.parseRace;

import gov.cdc.usds.simplereport.api.model.PersonUpdate;
import gov.cdc.usds.simplereport.api.model.pxp.PxpRequestWrapper;
import gov.cdc.usds.simplereport.api.model.pxp.PxpVerifyResponse;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.OrderStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.TestEventService;
import gov.cdc.usds.simplereport.service.TimeOfConsentService;
import java.util.UUID;
import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
@PreAuthorize(
    "@patientLinkService.verifyPatientLink(#body.getPatientLinkId(), #body.getDateOfBirth())")
@PostAuthorize("@restAuditlogManager.logRestSuccess(#request, returnObject)")
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

  /**
   * Verify that the patient-provided DOB matches the patient on file for the patient link id. It
   * returns the full patient object if so, otherwise it throws an exception
   */
  @PostMapping("/link/verify")
  public PxpVerifyResponse getPatientLinkVerify(
      @RequestBody PxpRequestWrapper<Void> body, HttpServletRequest request) {
    PatientLink pl = _contextHolder.getPatientLink();
    OrderStatus os = _contextHolder.getLinkedOrder().getOrderStatus();
    Person p = _contextHolder.getPatient();
    TestEvent te =
        os == OrderStatus.COMPLETED
            ? _contextHolder.getLinkedOrder().getTestEvent()
            : _tes.getLastTestResultsForPatient(p);
    _tocs.storeTimeOfConsent(pl);

    return new PxpVerifyResponse(p, os, te);
  }

  @PostMapping("/patient")
  public PxpVerifyResponse updatePatient(
      @RequestBody PxpRequestWrapper<PersonUpdate> body, HttpServletRequest request) {
    PersonUpdate person = body.getData();
    Person updated =
        _ps.updateMe(
            StreetAddress.deAndReSerializeForSafety(person.getAddress()),
            parsePhoneNumbers(person.getPhoneNumbers()),
            person.getRole(),
            parseEmail(person.getEmail()),
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
