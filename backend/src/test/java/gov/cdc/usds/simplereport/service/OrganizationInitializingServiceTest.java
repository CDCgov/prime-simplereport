package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.test_util.TestDataFactory.DEFAULT_ORG_ID;
import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class OrganizationInitializingServiceTest extends BaseServiceTest<DiseaseService> {
  @Autowired private TestDataFactory _dataFactory;
  @Autowired private PersonRepository _personRepository;
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

    Person expectedFirstPatient =
        firstPatient.makePatient(
            _org, firstPatientFirstName, firstPatientLastName, firstPatientBirthDate);
    Person expectedSecondPatient =
        secondPatient.makePatient(
            _org, secondPatientFirstName, secondPatientLastName, secondPatientBirthDate);
    List<Person> expectedPatients = List.of(expectedFirstPatient, expectedSecondPatient);

    for (int i = 0; i < patientsLookup.size(); i++) {
      Person actualPatient = patientsLookup.get(i);
      Person expectedPatient = expectedPatients.get(i);
      assertEquals(actualPatient.getNameInfo(), expectedPatient.getNameInfo());
      assertEquals(actualPatient.getBirthDate(), expectedPatient.getBirthDate());
      assertEquals(actualPatient.getRace(), expectedPatient.getRace());
      assertEquals(actualPatient.getRole(), expectedPatient.getRole());
      assertEquals(actualPatient.getAddress(), expectedPatient.getAddress());
      assertEquals(
          actualPatient.getEmployedInHealthcare(), expectedPatient.getEmployedInHealthcare());
      assertEquals(
          actualPatient.getResidentCongregateSetting(),
          expectedPatient.getResidentCongregateSetting());
      assertEquals(actualPatient.getEmail(), expectedPatient.getEmail());
      assertEquals(actualPatient.getTestResultDelivery(), expectedPatient.getTestResultDelivery());
      assertEquals(actualPatient.getGender(), expectedPatient.getGender());
      assertEquals(actualPatient.getGenderIdentity(), expectedPatient.getGenderIdentity());
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
}
