package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.Translators.parseState;
import static gov.cdc.usds.simplereport.api.Translators.parseString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@SliceTestConfiguration.WithSimpleReportStandardUser
class OrganizationInitializingServiceTest {
  @Autowired private PersonRepository _personRepository;
  @Autowired private OrganizationRepository _organizationRepository;
  @Autowired private DeviceTypeRepository _deviceTypeRepository;
  @Autowired private SpecimenTypeRepository _specimenTypeRepository;
  @Mock private InitialSetupProperties _mockProps;
  @Autowired private OrganizationInitializingService _service;

  private String orgExternalId;
  @Autowired private DbTruncator dbTruncator;

  @BeforeEach
  public void setup() {
    dbTruncator.truncateAll();
    String orgId = UUID.randomUUID().toString();
    orgExternalId = orgId + "EXTERNAL";
    Organization orgToBeCreated = new Organization(orgId, "k12", orgExternalId, true);
    _organizationRepository.save(orgToBeCreated);
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
            firstPatientFirstName, firstPatientLastName, firstPatientBirthDate, orgExternalId);
    InitialSetupProperties.ConfigPatient secondPatient =
        new InitialSetupProperties.ConfigPatient(
            secondPatientFirstName, secondPatientLastName, secondPatientBirthDate, orgExternalId);
    List<InitialSetupProperties.ConfigPatient> patients = List.of(firstPatient, secondPatient);
    _service.createPatients(patients);

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
        new InitialSetupProperties.ConfigPatient(firstName, lastName, birthDate, orgExternalId);
    List<InitialSetupProperties.ConfigPatient> patients = List.of(patient, patient);
    _service.createPatients(patients);
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
    _service.createPatients(List.of(patient));
    List<Person> patientLookup = _personRepository.findAll();
    assertEquals(0, patientLookup.size());
  }

  @Test
  void initDevices_doesNotAddDuplicateDeviceType() {
    String deviceName = "Saved COVID device";
    SpecimenType s = new SpecimenType("Hair", "000111222");
    SpecimenType swab = _specimenTypeRepository.save(s);
    DeviceType savedDevice = TestDataBuilder.createDeviceType(deviceName, List.of(swab));
    _deviceTypeRepository.save(savedDevice);
    InitialSetupProperties.ConfigDeviceType deviceToConfigure =
        new InitialSetupProperties.ConfigDeviceType(
            deviceName,
            "Updated COVID device Manufacturer",
            "Updated COVID device Model",
            15,
            List.of("12332-1"),
            List.of());
    when(_mockProps.getDeviceTypes()).thenReturn(List.of(deviceToConfigure));
    _service.initDevices();
    List<DeviceType> devices =
        _deviceTypeRepository.findAll().stream()
            .filter(d -> d.getName().equals(deviceName))
            .toList();
    assertEquals(1, devices.size());
    // make sure no updates were made
    assertEquals("Saved COVID device Manufacturer", devices.get(0).getManufacturer());
    assertEquals("Saved COVID device Model", devices.get(0).getModel());
  }

  private LocalDate getBirthDate(String birthDate) {
    DateTimeFormatter dateTimeFormat = DateTimeFormatter.ofPattern("M/d/yyyy");
    return LocalDate.parse(birthDate, dateTimeFormat);
  }
}
