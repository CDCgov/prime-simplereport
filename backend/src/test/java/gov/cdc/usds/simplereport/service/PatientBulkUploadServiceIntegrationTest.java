package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.Translators.parsePhoneType;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.uploads.PatientBulkUploadResponse;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.Role;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
@WithMockUser(
    username = TestUserIdentities.SITE_ADMIN_USER,
    authorities = {Role.SITE_ADMIN, Role.DEFAULT_ORG_ADMIN})
class PatientBulkUploadServiceIntegrationTest extends BaseServiceTest<PatientBulkUploadService> {
  public static final int PATIENT_PAGE_OFFSET = 0;
  public static final int PATIENT_PAGE_SIZE = 1000;

  @Autowired private PersonService personService;
  @Autowired private PhoneNumberRepository phoneNumberRepository;
  @Autowired private OrganizationService organizationService;

  @MockBean protected AddressValidationService addressValidationService;
  private StreetAddress address;
  private UUID firstFacilityId;
  private UUID secondFacilityId;

  @BeforeEach
  void setupData() {
    address = new StreetAddress("123 Main Street", null, "Washington", "DC", "20008", null);
    initSampleData();
    when(addressValidationService.getValidatedAddress(any(), any(), any(), any(), any(), any()))
        .thenReturn(address);
    List<UUID> facilityIds =
        organizationService.getFacilities(organizationService.getCurrentOrganization()).stream()
            .map(Facility::getInternalId)
            .collect(Collectors.toList());
    if (facilityIds.isEmpty()) {
      throw new IllegalStateException("This organization has no facilities");
    }
    firstFacilityId = facilityIds.get(0);
    secondFacilityId = facilityIds.get(1);
  }

  @Test
  void validCsv_savesPatientToOrganization() {
    // GIVEN
    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");

    // WHEN
    PatientBulkUploadResponse response = this._service.processPersonCSV(inputStream, null);

    // THEN
    assertThat(response.getStatus()).isEqualTo(UploadStatus.SUCCESS);

    assertThat(getPatients()).hasSize(1);
    Person patient = getPatients().get(0);

    assertThat(patient.getLastName()).isEqualTo("Doe");
    assertThat(patient.getRace()).isEqualTo("black");
    assertThat(patient.getEthnicity()).isEqualTo("not_hispanic");
    assertThat(patient.getBirthDate()).isEqualTo(LocalDate.of(1980, 11, 3));
    assertThat(patient.getGender()).isEqualTo("female");
    assertThat(patient.getRole()).isEqualTo(PersonRole.STAFF);

    assertThat(patient.getAddress()).isEqualTo(address);
    assertThat(patient.getCountry()).isEqualTo("USA");

    List<PhoneNumber> phoneNumbers =
        phoneNumberRepository.findAllByPersonInternalId(patient.getInternalId());
    assertThat(phoneNumbers).hasSize(1);
    PhoneNumber pn = phoneNumbers.get(0);
    assertThat(pn.getNumber()).isEqualTo("410-867-5309");
    assertThat(pn.getType()).isEqualTo(PhoneType.MOBILE);
    assertThat(patient.getEmail()).isEqualTo("jane@testingorg.com");

    assertThat(getPatientsForFacility(firstFacilityId))
        .hasSameSizeAs(getPatientsForFacility(secondFacilityId));
  }

  @Test
  void noPhoneNumberTypes_savesPatient() {
    // WHEN
    InputStream inputStream = loadCsv("patientBulkUpload/noPhoneNumberTypes.csv");
    PatientBulkUploadResponse response = this._service.processPersonCSV(inputStream, null);

    // THEN
    assertThat(response.getStatus()).isEqualTo(UploadStatus.SUCCESS);
    assertThat(getPatients()).hasSize(1);
  }

  @Test
  void duplicatePatient_isNotSaved() {
    // GIVEN
    personService.addPatient(
        firstFacilityId,
        "",
        "Jane",
        "",
        "Doe",
        "",
        LocalDate.of(1980, 11, 3),
        address,
        "USA",
        List.of(new PhoneNumber(parsePhoneType("mobile"), "410-867-5309")),
        PersonRole.STAFF,
        List.of("jane@testingorg.com"),
        "black",
        "not_hispanic",
        null,
        "female",
        false,
        false,
        "",
        null);
    assertThat(getPatients()).hasSize(1);

    // WHEN
    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");
    PatientBulkUploadResponse response = this._service.processPersonCSV(inputStream, null);

    // THEN
    assertThat(response.getStatus()).isEqualTo(UploadStatus.SUCCESS);
    assertThat(getPatients()).hasSize(1);
  }

  @Test
  void duplicatePatient_isNotAddedToBatch() {
    // WHEN
    InputStream inputStream = loadCsv("patientBulkUpload/duplicatePatients.csv");
    PatientBulkUploadResponse response = this._service.processPersonCSV(inputStream, null);

    // THEN
    assertThat(response.getStatus()).isEqualTo(UploadStatus.SUCCESS);
    assertThat(getPatients()).hasSize(1);
  }

  @Test
  void patientSavedToSingleFacility_successful() {
    // GIVEN
    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");

    // WHEN
    PatientBulkUploadResponse response =
        this._service.processPersonCSV(inputStream, firstFacilityId);

    // THEN
    assertThat(response.getStatus()).isEqualTo(UploadStatus.SUCCESS);

    assertThat(getPatientsForFacility(firstFacilityId)).hasSize(1);
    assertThat(getPatientsForFacility(secondFacilityId)).isEmpty();
  }

  @Test
  void missingHeaders_returnsError() {
    // GIVEN
    InputStream inputStream = loadCsv("patientBulkUpload/missingHeaders.csv");

    // WHEN
    PatientBulkUploadResponse response =
        this._service.processPersonCSV(inputStream, firstFacilityId);

    // THEN
    assertThat(response.getStatus()).isEqualTo(UploadStatus.FAILURE);
    assertThat(response.getErrors()).isNotEmpty();
    assertThat(getPatients()).isEmpty();
  }

  @Test
  void invalidData_returnsError() {
    // GIVEN
    InputStream inputStream = loadCsv("patientBulkUpload/missingRequiredFields.csv");

    // WHEN
    PatientBulkUploadResponse response =
        this._service.processPersonCSV(inputStream, firstFacilityId);

    // THEN
    assertThat(response.getStatus()).isEqualTo(UploadStatus.FAILURE);
    assertThat(response.getErrors()).isNotEmpty();
    assertThat(getPatients()).isEmpty();
  }

  private InputStream loadCsv(String csvFile) {
    return PatientBulkUploadServiceIntegrationTest.class
        .getClassLoader()
        .getResourceAsStream(csvFile);
  }

  private List<Person> getPatients() {
    return this.personService.getPatients(
        null, PATIENT_PAGE_OFFSET, PATIENT_PAGE_SIZE, false, null, false);
  }

  private List<Person> getPatientsForFacility(UUID facilityId) {
    return this.personService.getPatients(
        facilityId, PATIENT_PAGE_OFFSET, PATIENT_PAGE_SIZE, false, null, false);
  }
}
