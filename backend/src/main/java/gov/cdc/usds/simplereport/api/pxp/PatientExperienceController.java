package gov.cdc.usds.simplereport.api.pxp;

import static gov.cdc.usds.simplereport.api.Translators.parseEmail;
import static gov.cdc.usds.simplereport.api.Translators.parseEthnicity;
import static gov.cdc.usds.simplereport.api.Translators.parseGender;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;
import static gov.cdc.usds.simplereport.api.Translators.parseRace;
import static gov.cdc.usds.simplereport.api.Translators.parseString;
import static gov.cdc.usds.simplereport.api.Translators.parseSymptoms;

import gov.cdc.usds.simplereport.api.model.AoEQuestions;
import gov.cdc.usds.simplereport.api.model.errors.InvalidPatientLinkException;
import gov.cdc.usds.simplereport.api.model.pxp.PxpApiWrapper;
import gov.cdc.usds.simplereport.api.model.pxp.PxpPersonWrapper;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.TestEventService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import java.util.Map;
import javax.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Note that this controller self-authorizes by means of this @PreAuthorize annotation and its
 * routes are set to permitAll() in SecurityConfiguration. If this changes, please update the
 * documentation on both sides
 */
@ConditionalOnProperty(name = "simple-report.feature-flags.patient-links", havingValue = "true")
@PreAuthorize(
    "@patientLinkService.verifyPatientLink(#body.getPatientLinkId(), #body.getDateOfBirth())")
@RestController
@RequestMapping("/pxp")
@Validated
public class PatientExperienceController {
  private static final Logger LOG = LoggerFactory.getLogger(PatientExperienceController.class);

  @Autowired private PersonService ps;

  @Autowired private PatientLinkService pls;

  @Autowired private TestOrderService tos;

  @Autowired private TestEventService tes;

  @PostConstruct
  private void init() {
    LOG.info("Patient Experience REST endpoints enabled");
  }

  /**
   * Verify that the patient-provided DOB matches the patient on file for the patient link id. It
   * returns the full patient object if so, otherwise it throws an exception
   */
  @PutMapping("/link/verify")
  public PxpPersonWrapper getPatientLinkVerify(@RequestBody PxpApiWrapper<Void> body)
      throws InvalidPatientLinkException {
    Person p = pls.getPatientFromLink(body.getPatientLinkId());
    TestEvent te = tes.getLastTestResultsForPatient(p);
    return new PxpPersonWrapper(p, te);
  }

  @PutMapping("/patient")
  public Person updatePatient(@RequestBody PxpApiWrapper<Person> body)
      throws InvalidPatientLinkException {
    Person person = body.getData();
    return ps.updateMe(
        parseString(person.getFirstName()),
        parseString(person.getMiddleName()),
        parseString(person.getLastName()),
        parseString(person.getSuffix()),
        person.getBirthDate(),
        StreetAddress.deAndReSerializeForSafety(person.getAddress()),
        parsePhoneNumber(person.getTelephone()),
        person.getRole(),
        parseEmail(person.getEmail()),
        parseRace(person.getRace()),
        parseEthnicity(person.getEthnicity()),
        parseGender(person.getGender()),
        person.getResidentCongregateSetting(),
        person.getEmployedInHealthcare());
  }

  @PutMapping("/questions")
  public void patientLinkSubmit(@RequestBody PxpApiWrapper<AoEQuestions> body)
      throws InvalidPatientLinkException {
    AoEQuestions data = body.getData();
    Map<String, Boolean> symptomsMap = parseSymptoms(data.getSymptoms());

    tos.updateMyTimeOfTestQuestions(
        data.getPregnancy(),
        symptomsMap,
        data.isFirstTest(),
        data.getPriorTestDate(),
        data.getPriorTestType(),
        data.getPriorTestResult() == null ? null : TestResult.valueOf(data.getPriorTestResult()),
        data.getSymptomOnset(),
        data.getNoSymptoms());
  }
}
