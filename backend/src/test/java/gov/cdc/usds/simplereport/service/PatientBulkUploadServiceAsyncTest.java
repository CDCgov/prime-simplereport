package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.uploads.BaseMultiThreadFullStackTest;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.Callable;
import org.awaitility.Awaitility;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.context.SecurityContextHolder;

/*
 * We can't use the standard BaseServiceTest here because this service is async and requires a request context to operate.
 */

public class PatientBulkUploadServiceAsyncTest extends BaseMultiThreadFullStackTest {

  //  @Autowired OrganizationInitializingService _initService;
  //  @Autowired PersonService _personService;
  //  @Autowired OrganizationService _organizationService;
  @Autowired PatientBulkUploadServiceAsync _service;

  public static final int PATIENT_PAGE_OFFSET = 0;
  public static final int PATIENT_PAGE_SIZE = 1000;

  @MockBean protected AddressValidationService addressValidationService;
  private StreetAddress address;

  @BeforeAll
  static void configuration() {
    SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
    Awaitility.setDefaultTimeout(Duration.ofSeconds(60));
  }

  @BeforeEach
  void setup() {
    initSampleData();
    address = new StreetAddress("123 Main Street", null, "Washington", "DC", "20008", null);
    when(addressValidationService.getValidatedAddress(any(), any(), any(), any(), any(), any()))
        .thenReturn(address);
  }

  // two ways this test can fail:
  // 1. when running as site admin user, don't have permission to getPatients()
  // 2. When running as org admin user or all facility standard user, N+1 error on
  // DeviceSpecimenType
  // om.yannbriancon.exception.NPlusOneQueriesException: N+1 queries detected on a query for the
  // entity gov.cdc.usds.simplereport.db.model.DeviceSpecimenType
  //    at org.gradle.api.internal.tasks.testing.worker.TestWorker$3.run(TestWorker.java:193)
  //    Hint: Missing Lazy fetching configuration on a field of one of the entities fetched in the
  // query

  @Test
  @SliceTestConfiguration.WithSimpleReportOrgAdminUser
  //  @SliceTestConfiguration.WithSimpleReportStandardAllFacilitiesUser
  void validPerson_savedToDatabase() throws IOException {
    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");
    byte[] content = inputStream.readAllBytes();

    this._service.savePatients(content, null);

    // this await call specifically thows the "no authentication token" exception
    // taking it out causes the test to fail in a slightly more normal way, because the assertion
    // size doesn't match
    // note: the above is only true outside the n+1 issues
    await().until(patientsAddedToRepository(1));

    assertThat(getPatients()).hasSize(1);
  }

  /**
   * @Test void duplicatePatient_isNotSaved() { // GIVEN personService.addPatient( firstFacilityId,
   * "", "Jane", "", "Doe", "", LocalDate.of(1980, 11, 3), address, "USA", List.of(new
   * PhoneNumber(parsePhoneType("mobile"), "410-867-5309")), PersonRole.STAFF,
   * List.of("jane@testingorg.com"), "black", "not_hispanic", null, "female", false, false, "",
   * null); assertThat(getPatients()).hasSize(1);
   *
   * <p>// WHEN InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");
   * PatientBulkUploadResponse response = this._service.processPersonCSV(inputStream, null);
   *
   * <p>// THEN assertThat(response.getStatus()).isEqualTo(UploadStatus.SUCCESS);
   * assertThat(getPatients()).hasSize(1); } @Test void duplicatePatient_isNotAddedToBatch() { //
   * WHEN InputStream inputStream = loadCsv("patientBulkUpload/duplicatePatients.csv");
   * PatientBulkUploadResponse response = this._service.processPersonCSV(inputStream, null);
   *
   * <p>// THEN assertThat(response.getStatus()).isEqualTo(UploadStatus.SUCCESS);
   * assertThat(getPatients()).hasSize(1); } @Test void patientSavedToSingleFacility_successful() {
   * // GIVEN InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");
   *
   * <p>// WHEN PatientBulkUploadResponse response = this._service.processPersonCSV(inputStream,
   * firstFacilityId);
   *
   * <p>// THEN assertThat(response.getStatus()).isEqualTo(UploadStatus.SUCCESS);
   *
   * <p>assertThat(getPatientsForFacility(firstFacilityId)).hasSize(1);
   * assertThat(getPatientsForFacility(secondFacilityId)).isEmpty(); }
   *
   * @param csvFile
   * @return
   */

  //  @Test
  //  void validCsv_savesPatientToOrganization() {
  //    // GIVEN
  //    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");
  //    TestUserIdentities.setFacilityAuthorities(
  //        organizationService.getFacilityInCurrentOrg(firstFacilityId));
  //    TestUserIdentities.setFacilityAuthorities(
  //        organizationService.getFacilityInCurrentOrg(secondFacilityId));
  //
  //    // WHEN
  //    PatientBulkUploadResponse response = this._service.processPersonCSV(inputStream, null);
  //
  //    // THEN
  //    // ugh need to figure out how to inject the security context into tests, too
  //    await().until(patientsAddedToRepository());
  //    assertThat(response.getStatus()).isEqualTo(UploadStatus.SUCCESS);
  //
  //    assertThat(getPatients()).hasSize(1);
  //    Person patient = getPatients().get(0);
  //
  //    assertThat(patient.getLastName()).isEqualTo("Doe");
  //    assertThat(patient.getRace()).isEqualTo("black");
  //    assertThat(patient.getEthnicity()).isEqualTo("not_hispanic");
  //    assertThat(patient.getBirthDate()).isEqualTo(LocalDate.of(1980, 11, 3));
  //    assertThat(patient.getGender()).isEqualTo("female");
  //    assertThat(patient.getRole()).isEqualTo(PersonRole.STAFF);
  //
  //    assertThat(patient.getAddress()).isEqualTo(address);
  //    assertThat(patient.getCountry()).isEqualTo("USA");
  //
  //    List<PhoneNumber> phoneNumbers =
  //        phoneNumberRepository.findAllByPersonInternalId(patient.getInternalId());
  //    assertThat(phoneNumbers).hasSize(1);
  //    PhoneNumber pn = phoneNumbers.get(0);
  //    assertThat(pn.getNumber()).isEqualTo("410-867-5309");
  //    assertThat(pn.getType()).isEqualTo(PhoneType.MOBILE);
  //    assertThat(patient.getEmail()).isEqualTo("jane@testingorg.com");
  //
  //    assertThat(getPatientsForFacility(firstFacilityId))
  //        .hasSameSizeAs(getPatientsForFacility(secondFacilityId));
  //  }

  //  @Test
  //  void noPhoneNumberTypes_savesPatient() {
  //    // WHEN
  //    InputStream inputStream = loadCsv("patientBulkUpload/noPhoneNumberTypes.csv");
  //    PatientBulkUploadResponse response = this._service.processPersonCSV(inputStream, null);
  //
  //    // THEN
  //    assertThat(response.getStatus()).isEqualTo(UploadStatus.SUCCESS);
  //    assertThat(getPatients()).hasSize(1);
  //  }

  private InputStream loadCsv(String csvFile) {
    return PatientBulkUploadServiceAsyncTest.class.getClassLoader().getResourceAsStream(csvFile);
  }

  private List<Person> getPatients() {
    return this._personService.getPatients(
        null, PATIENT_PAGE_OFFSET, PATIENT_PAGE_SIZE, false, null, false);
  }

  // Saving patients is now an asynchronous process - need to wait for it to complete
  private Callable<Boolean> patientsAddedToRepository(int expectedSize) {
    return () -> getPatients().size() > expectedSize;
  }
}
