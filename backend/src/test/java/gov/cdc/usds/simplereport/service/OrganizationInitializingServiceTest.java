package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.Translators.parseState;
import static gov.cdc.usds.simplereport.api.Translators.parseString;
import static gov.cdc.usds.simplereport.test_util.TestDataFactory.DEFAULT_ORG_ID;
import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.db.model.Condition;
import gov.cdc.usds.simplereport.db.model.Lab;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Specimen;
import gov.cdc.usds.simplereport.db.model.SpecimenBodySite;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.db.repository.ConditionRepository;
import gov.cdc.usds.simplereport.db.repository.LabRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenBodySiteRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenRepository;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class OrganizationInitializingServiceTest extends BaseServiceTest<DiseaseService> {
  @Autowired private TestDataFactory _dataFactory;
  @Autowired private PersonRepository _personRepository;
  @Autowired private ConditionRepository conditionRepository;
  @Autowired private LabRepository labRepository;
  @Autowired private SpecimenRepository specimenRepository;
  @Autowired private SpecimenBodySiteRepository specimenBodySiteRepository;
  @Autowired OrganizationInitializingService _organizationInitializingService;

  private Organization _org;

  @BeforeEach
  public void setup() {
    _org = _dataFactory.saveValidOrganization();
    _dataFactory.createValidFacility(_org);
  }

  @Test
  void createPatients_success_addsPatients() {
    String firstPatientFirstName = "John";
    String firstPatientLastName = "Doe";
    String firstPatientBirthDate = "03/03/2020";

    String secondPatientFirstName = "Mary";
    String secondPatientLastName = "Jane";
    String secondPatientBirthDate = "01/01/2010";

    InitialSetupProperties.ConfigPatient firstPatient =
        new InitialSetupProperties.ConfigPatient(
            firstPatientFirstName, firstPatientLastName, firstPatientBirthDate, DEFAULT_ORG_ID);
    InitialSetupProperties.ConfigPatient secondPatient =
        new InitialSetupProperties.ConfigPatient(
            secondPatientFirstName, secondPatientLastName, secondPatientBirthDate, DEFAULT_ORG_ID);
    List<InitialSetupProperties.ConfigPatient> patients = List.of(firstPatient, secondPatient);
    _organizationInitializingService.createPatients(patients);

    List<Person> patientsLookup = _personRepository.findAll();
    assertEquals(2, patientsLookup.size());

    StreetAddress expectedPatientAddress =
        new StreetAddress(
            parseString("123 Main Street"),
            parseString(""),
            parseString("Minneapolis"),
            parseState("MN"),
            parseString("55407"),
            parseString("Hennepin"));
    Person expectedFirstPatient =
        Person.builder()
            .firstName(firstPatientFirstName)
            .lastName(firstPatientLastName)
            .birthDate(getBirthDate(firstPatientBirthDate))
            .build();
    Person expectedSecondPatient =
        Person.builder()
            .firstName(secondPatientFirstName)
            .lastName(secondPatientLastName)
            .birthDate(getBirthDate(secondPatientBirthDate))
            .build();
    List<Person> expectedPatients = List.of(expectedFirstPatient, expectedSecondPatient);

    for (int i = 0; i < patientsLookup.size(); i++) {
      Person actualPatient = patientsLookup.get(i);
      Person expectedPatient = expectedPatients.get(i);
      assertEquals(actualPatient.getNameInfo(), expectedPatient.getNameInfo());
      assertEquals(actualPatient.getBirthDate(), expectedPatient.getBirthDate());
      assertEquals(actualPatient.getRace(), "other");
      assertEquals(actualPatient.getRole(), PersonRole.STAFF);
      assertEquals(actualPatient.getAddress(), expectedPatientAddress);
      assertEquals(actualPatient.getEmployedInHealthcare(), true);
      assertEquals(actualPatient.getResidentCongregateSetting(), true);
      assertEquals(actualPatient.getEmail(), null);
      assertEquals(actualPatient.getTestResultDelivery(), TestResultDeliveryPreference.NONE);
      assertEquals(actualPatient.getGender(), "male");
      assertEquals(actualPatient.getGenderIdentity(), "male");
    }
  }

  @Test
  void createPatients_doesNotAddDuplicatePatient() {
    String firstName = "John";
    String lastName = "Doe";
    String birthDate = "03/03/2020";

    InitialSetupProperties.ConfigPatient patient =
        new InitialSetupProperties.ConfigPatient(firstName, lastName, birthDate, DEFAULT_ORG_ID);
    List<InitialSetupProperties.ConfigPatient> patients = List.of(patient, patient);
    _organizationInitializingService.createPatients(patients);
    List<Person> patientLookup = _personRepository.findAll();
    assertEquals(1, patientLookup.size());
  }

  @Test
  void createPatients_withInvalidOrgExternalId_doesNotAddPatient() {
    String firstName = "John";
    String lastName = "Doe";
    String birthDate = "03/03/2020";

    InitialSetupProperties.ConfigPatient patient =
        new InitialSetupProperties.ConfigPatient(
            firstName, lastName, birthDate, "NONEXISTENT_ORG_EXTERNAL_ID");
    _organizationInitializingService.createPatients(List.of(patient));
    List<Person> patientLookup = _personRepository.findAll();
    assertEquals(0, patientLookup.size());
  }

  @Test
  void initUELRExampleData_success_addsConditionsLabsSpecimensSpecimenBodySites() {
    Condition testCondition = new Condition("conditionCode", "conditionDisplay", "snomedNameHere");
    testCondition.setLabs(
        Set.of(
            new Lab(
                "labCode",
                "labDisplay",
                "labDescription",
                "labLongCommonName",
                "labScaleCode",
                "labScaleDisplay",
                "labSystemCode",
                "labSystemDisplay",
                "labAnswerList",
                "labOrderOrObservation",
                true)));

    Specimen testSpecimen =
        new Specimen("loincSystemCode", "loincSystemDisplay", "snomedCode", "snomedDisplay");

    testSpecimen
        .getBodySiteList()
        .add(
            new SpecimenBodySite(
                "snomedSpecimenCode",
                "snomedSpecimenDisplay",
                "snomedSiteCode",
                "snomedSiteDisplay"));

    _organizationInitializingService.initUELRExampleData(
        List.of(testCondition), List.of(testSpecimen));

    assertEquals(1, conditionRepository.findAll().size());
    assertEquals(1, labRepository.findAll().size());
    assertEquals(1, specimenRepository.findAll().size());
    assertEquals(1, specimenBodySiteRepository.count());
  }

  private LocalDate getBirthDate(String birthDate) {
    DateTimeFormatter dateTimeFormat = DateTimeFormatter.ofPattern("M/d/yyyy");
    return LocalDate.parse(birthDate, dateTimeFormat);
  }
}
