package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.Role;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
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

  @Autowired private PersonService _ps;
  @MockBean protected AddressValidationService _addressValidation;
  private StreetAddress address;

  @BeforeEach
  void setupData() {
    address = new StreetAddress("123 Main Street", null, "Washington", "DC", "20008", null);
    initSampleData();
    when(_addressValidation.getValidatedAddress(any(), any(), any(), any(), any(), any()))
        .thenReturn(address);
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
    this._service.processPersonCSV(inputStream);

    // THEN
    assertThat(getPatients()).hasSize(1);
    assertThat(getPatients().get(0).getLastName()).isEqualTo("Best");
    assertThat(getPatients().get(0).getAddress()).isEqualTo(address);
  }

  @Test
  void testInsertInvalidZipCode() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-invalid-zipcode.csv");

    // WHEN
    var error =
        assertThrows(
            IllegalArgumentException.class, () -> this._service.processPersonCSV(inputStream));

    // THEN
    assertThat(error.getMessage()).isEqualTo("Error on row 1; Invalid zip code");
    assertThat(getPatients()).isEmpty();
  }

  @Test
  void testInsertNoCountry() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-no-country.csv");

    // WHEN
    this._service.processPersonCSV(inputStream);

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
            IllegalArgumentException.class, () -> this._service.processPersonCSV(inputStream));

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
        assertThrows(IllegalArgumentException.class, () -> this._service.processPersonCSV(bis));

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
        assertThrows(IllegalArgumentException.class, () -> this._service.processPersonCSV(bis));

    // THEN
    assertThat(error.getMessage()).contains("Not enough column values: expected 21, found 1");
  }

  @Test
  void testInvalidPhoneNumber() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-invalid-phone.csv");

    // WHEN
    var error =
        assertThrows(
            IllegalArgumentException.class, () -> this._service.processPersonCSV(inputStream));

    // THEN
    assertThat(error.getMessage())
        .isEqualTo("Error on row 1; [not a phone number] is not a valid phone number");
  }

  @Test
  void testNoHeader() {
    // GIVEN
    InputStream inputStream = loadCsv("test-upload-valid-no-header.csv");

    // WHEN
    this._service.processPersonCSV(inputStream);

    // THEN
    assertThat(getPatients()).hasSize(1);
  }

  private InputStream loadCsv(String csvFile) {
    return UploadServiceTest.class.getClassLoader().getResourceAsStream(csvFile);
  }

  private List<Person> getPatients() {
    return this._ps.getPatients(null, PATIENT_PAGE_OFFSET, PATIENT_PAGE_SIZE, false, null);
  }
}
