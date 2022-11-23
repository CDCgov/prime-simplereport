package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

import gov.cdc.usds.simplereport.api.BaseFullStackTest;
import gov.cdc.usds.simplereport.db.model.Person;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.TestPropertySource;

// @RunWith(SpringRunner.class)
// @SpringBootTest(
//    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
//    properties = {"simple-report.authorization.role-prefix=" +
// TestUserIdentities.TEST_ROLE_PREFIX})
// @Import({SliceTestConfiguration.class, DataSourceConfiguration.class})
@TestPropertySource(
    properties = {
      //                "hibernate.query.interceptor.error-level=ERROR",
      "spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"
    })
public class PatientBulkUploadServiceAsyncTest extends BaseFullStackTest {

  @Autowired OrganizationInitializingService _initService;
  @Autowired PersonService _personService;
  @Autowired AddressValidationService _addressValidationService;
  @Autowired OrganizationService _organizationService;
  @Autowired PatientBulkUploadServiceAsync _service;

  public static final int PATIENT_PAGE_OFFSET = 0;
  public static final int PATIENT_PAGE_SIZE = 1000;

  @BeforeAll
  static void configuration() {
    SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
    Awaitility.setDefaultTimeout(Duration.ofSeconds(60));
  }

  @BeforeEach
  void setup() {
    _initService.initAll();
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
