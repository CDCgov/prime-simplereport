package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.PhoneNumberRepository;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.Role;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
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
class UploadServiceTest extends BaseServiceTest<UploadService> {
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
  void testRowWithValue() {
    String value = this._service.getRow(Map.of("key1", "value1"), "key1", true);
    assertThat(value).isEqualTo("value1");
  }

  @Test
  void testRowWithEmptyValue() {
    String value = this._service.getRow(Map.of("key1", ""), "key1", false);
    assertThat(value).isEqualTo("");
  }

  @Test
  void testRowWithEmptyValueRequired() {
    assertThrows(
        IllegalArgumentException.class,
        () -> this._service.getRow(Map.of("key1", ""), "key1", true));
  }

  @Test
  void testUploadValidCsv() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload.csv");

    // WHEN
    this._service.processPersonCSV(inputStream, null);

    // THEN
    assertThat(getPatients()).hasSize(1);
    Person p = getPatients().get(0);
    assertThat(p.getLastName()).isEqualTo("Best");
    assertThat(p.getAddress()).isEqualTo(address);
    List<PhoneNumber> phoneNumbers =
        phoneNumberRepository.findAllByPersonInternalId(p.getInternalId());
    assertThat(phoneNumbers).hasSize(1);
    PhoneNumber pn = phoneNumbers.get(0);
    assertThat(pn.getNumber()).isEqualTo("(565) 666-7777");
    assertThat(pn.getType()).isEqualTo(PhoneType.MOBILE);
  }

  @Test
  void withoutFacilityId_validCsvUploadsToOrganization() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload.csv");

    // WHEN
    this._service.processPersonCSV(inputStream, null);

    assertThat(getPatientsForFacility(firstFacilityId).size())
        .isEqualTo(getPatientsForFacility(secondFacilityId).size());
  }

  @Test
  void withFacilityId_validCsvUploadsToSingleFacility() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload.csv");

    // WHEN
    this._service.processPersonCSV(inputStream, firstFacilityId);

    assertThat(getPatientsForFacility(firstFacilityId).size()).isEqualTo(1);
    assertThat(getPatientsForFacility(secondFacilityId).size()).isEqualTo(0);
  }

  @Test
  void testInsertInvalidZipCode() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-invalid-zipcode.csv");

    // WHEN
    var error =
        assertThrows(
            IllegalArgumentException.class,
            () -> this._service.processPersonCSV(inputStream, null));

    // THEN
    assertThat(error.getMessage()).isEqualTo("Error on row 1; Invalid zip code");
    assertThat(getPatients()).isEmpty();
  }

  @Test
  void testInvalidPhoneType() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-invalid-phone-type.csv");

    // WHEN
    var error =
        assertThrows(
            IllegalArgumentException.class,
            () -> this._service.processPersonCSV(inputStream, null));

    // THEN
    assertThat(error.getMessage()).isEqualTo("Error on row 1; Invalid PhoneType received");
    assertThat(getPatients()).isEmpty();
  }

  @Test
  void testNoPhoneType() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-no-phone-type.csv");

    // WHEN
    this._service.processPersonCSV(inputStream, null);

    // THEN
    assertThat(getPatients()).hasSize(1);
    Person p = getPatients().get(0);
    List<PhoneNumber> phoneNumbers =
        phoneNumberRepository.findAllByPersonInternalId(p.getInternalId());
    assertThat(phoneNumbers).hasSize(1);
    PhoneNumber pn = phoneNumbers.get(0);
    assertThat(pn.getNumber()).isEqualTo("(565) 666-7777");
    assertThat(pn.getType()).isNull();
  }

  @Test
  void testInsertNoCountry() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-no-country.csv");

    // WHEN
    this._service.processPersonCSV(inputStream, null);

    // THEN
    assertThat(getPatients()).hasSize(1);
    assertThat(getPatients().get(0).getLastName()).isEqualTo("Best");
    assertThat(getPatients().get(0).getAddress()).isEqualTo(address);
  }

  @Test
  void testInsertOneBadRow() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-one-invalid-row.csv");

    // WHEN
    var error =
        assertThrows(
            IllegalArgumentException.class,
            () -> this._service.processPersonCSV(inputStream, null));

    // THEN
    assertThat(error.getMessage()).isEqualTo("Error on row 4; [abc] is not a valid date");
    assertThat(getPatients()).isEmpty();
  }

  @Test
  void testNotCSV() {
    // GIVEN
    var bis = new ByteArrayInputStream("this is not a CSV".getBytes(StandardCharsets.UTF_8));

    // WHEN
    var error =
        assertThrows(
            IllegalArgumentException.class, () -> this._service.processPersonCSV(bis, null));

    // THEN
    assertThat(error.getMessage()).contains("Not enough column values:");
    assertThat(getPatients()).isEmpty();
  }

  @Test
  void testMalformedCSV() {
    // GIVEN
    var bis = new ByteArrayInputStream("patientID\n'123445'\n".getBytes(StandardCharsets.UTF_8));

    // WHEN
    var error =
        assertThrows(
            IllegalArgumentException.class, () -> this._service.processPersonCSV(bis, null));

    // THEN
    assertThat(error.getMessage()).contains("Not enough column values: expected 21, found 1");
  }

  @Test
  void testNoEthnicity() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-no-ethnicity.csv");

    // WHEN
    var error =
        assertThrows(
            IllegalArgumentException.class,
            () -> this._service.processPersonCSV(inputStream, null));

    // THEN
    assertThat(error.getMessage()).isEqualTo("Error on row 1; Ethnicity is required.");
  }

  @Test
  void testInvalidEthnicity() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-invalid-ethnicity.csv");

    // WHEN
    var error =
        assertThrows(
            IllegalArgumentException.class,
            () -> this._service.processPersonCSV(inputStream, null));

    // THEN
    assertThat(error.getMessage()).contains("Error on row 1; \"InvalidEthnicity\" must be one of");
  }

  @Test
  void testNoRace() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-no-race.csv");

    // WHEN
    var error =
        assertThrows(
            IllegalArgumentException.class,
            () -> this._service.processPersonCSV(inputStream, null));

    // THEN
    assertThat(error.getMessage()).isEqualTo("Error on row 1; Race is required.");
  }

  @Test
  void testInvalidRace() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-invalid-race.csv");

    // WHEN
    var error =
        assertThrows(
            IllegalArgumentException.class,
            () -> this._service.processPersonCSV(inputStream, null));

    // THEN
    assertThat(error.getMessage()).contains("Error on row 1; \"InvalidRace\" must be one of");
  }

  @Test
  void testInvalidPhoneNumber() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-invalid-phone.csv");

    // WHEN
    var error =
        assertThrows(
            IllegalArgumentException.class,
            () -> this._service.processPersonCSV(inputStream, null));

    // THEN
    assertThat(error.getMessage())
        .isEqualTo("Error on row 1; [not a phone number] is not a valid phone number");
  }

  @Test
  void testNoHeader_success() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-valid-no-header.csv");

    // WHEN
    this._service.processPersonCSV(inputStream, null);

    // THEN
    assertThat(getPatients()).hasSize(1);
  }

  private InputStream loadCsv(String csvFile) {
    return UploadServiceTest.class.getClassLoader().getResourceAsStream(csvFile);
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
