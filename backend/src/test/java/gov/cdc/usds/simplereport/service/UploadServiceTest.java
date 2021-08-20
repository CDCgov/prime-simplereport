package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.Role;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.io.ByteArrayInputStream;
import java.io.IOException;
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

@WithMockUser(
    username = TestUserIdentities.SITE_ADMIN_USER,
    authorities = {Role.SITE_ADMIN, Role.DEFAULT_ORG_ADMIN})
@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class UploadServiceTest extends BaseServiceTest<UploadService> {
  public static final int PATIENT_PAGEOFFSET = 0;
  public static final int PATIENT_PAGESIZE = 1000;

  @Autowired private PersonService _ps;
  @MockBean protected AddressValidationService _addressValidation;
  private final StreetAddress address =
      new StreetAddress("123 Main Street", null, "Washington", "DC", "20008", null);

  @BeforeEach
  void setupData() {
    initSampleData();
    when(_addressValidation.getValidatedAddress(any(), any(), any(), any(), any(), any()))
        .thenReturn(address);
  }

  @Test
  void testRowWithValue() {
    String value = this._service.getRow(Map.of("key1", "value1"), "key1", true);
    assertEquals("value1", value);
  }

  @Test
  void testRowWithEmptyValue() {
    String value = this._service.getRow(Map.of("key1", ""), "key1", false);
    assertEquals("", value);
  }

  @Test
  void testRowWithEmptyValueRequired() {
    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> this._service.getRow(Map.of("key1", ""), "key1", true));
  }

  @Test
  void testInsert() throws IOException {
    // Read the test CSV file
    try (InputStream inputStream =
        UploadServiceTest.class.getClassLoader().getResourceAsStream("test-upload.csv")) {
      this._service.processPersonCSV(inputStream);
    }

    final List<Person> patients =
        this._ps.getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null);
    assertAll(
        () -> assertEquals(1, patients.size()),
        () -> assertEquals("Best", patients.get(0).getLastName()),
        () ->
            assertEquals(address, patients.get(0).getAddress(), "Should have the correct address"));
  }

  @Test
  void testInsertOneBadRow() throws IOException {
    // Read the test CSV file
    try (InputStream inputStream =
        UploadServiceTest.class
            .getClassLoader()
            .getResourceAsStream("test-upload-one-invalid-row.csv")) {
      final IllegalGraphqlArgumentException e =
          assertThrows(
              IllegalGraphqlArgumentException.class,
              () -> this._service.processPersonCSV(inputStream),
              "Should fail to parse. Missing facilityId");

      final List<Person> patients =
          this._ps.getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null);
      assertEquals(0, patients.size());
    }
  }

  @Test
  void testNotCSV() throws IOException {
    try (ByteArrayInputStream bis =
        new ByteArrayInputStream("this is not a CSV".getBytes(StandardCharsets.UTF_8))) {
      final IllegalGraphqlArgumentException e =
          assertThrows(
              IllegalGraphqlArgumentException.class,
              () -> this._service.processPersonCSV(bis),
              "Should fail to parse");
      assertTrue(
          e.getMessage().contains("Not enough column values:"),
          "Should have correct error message");
      assertEquals(
          0,
          this._ps.getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null).size(),
          "Should not have any patients");
    }
  }

  @Test
  void testMalformedCSV() throws IOException {
    try (ByteArrayInputStream bis =
        new ByteArrayInputStream("patientID\n'123445'\n".getBytes(StandardCharsets.UTF_8))) {
      final IllegalGraphqlArgumentException e =
          assertThrows(
              IllegalGraphqlArgumentException.class,
              () -> this._service.processPersonCSV(bis),
              "CSV parsing should fail");
      assertTrue(
          e.getMessage().contains("Not enough column values: expected 20, found 1"),
          "Should have correct error message");
    }
  }

  @Test
  void testInvalidPhoneNumber() throws Exception {
    try (InputStream inputStream =
        UploadServiceTest.class
            .getClassLoader()
            .getResourceAsStream("test-upload-invalid-phone.csv")) {
      assertThrows(
          IllegalArgumentException.class, () -> this._service.processPersonCSV(inputStream));
    }
  }

  @Test
  void testNoHeader() throws Exception {
    try (InputStream inputStream =
        UploadServiceTest.class
            .getClassLoader()
            .getResourceAsStream("test-upload-valid-no-header.csv")) {
      this._service.processPersonCSV(inputStream);
    }
    List<Person> patients =
        this._ps.getPatients(null, PATIENT_PAGEOFFSET, PATIENT_PAGESIZE, false, null);
    assertEquals(1, patients.size(), "Should have 1 patient");
  }
}
