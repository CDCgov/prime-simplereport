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

  @Test
  //  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  @SliceTestConfiguration.WithSimpleReportStandardAllFacilitiesUser
  void validPerson_savedToDatabase() throws IOException {
    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");
    byte[] content = inputStream.readAllBytes();

    this._service.savePatients(content, null);

    // this await call specifically thows the "no authentication token" exception
    // taking it out causes the test to fail in a slightly more normal way, because the assertion
    // size doesn't match
    // specifically, getUsername in findAllOrganizationRoles() fails and throws an exception
    //    "An Authentication object was not found in the SecurityContext"
    await().until(patientsAddedToRepository(1));

    assertThat(getPatients()).hasSize(1);
  }

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
