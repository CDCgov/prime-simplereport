package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.config.DataSourceConfiguration;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

// @RunWith(SpringRunner.class)
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"simple-report.authorization.role-prefix=" + TestUserIdentities.TEST_ROLE_PREFIX})
@Import({SliceTestConfiguration.class, DataSourceConfiguration.class})
public class PatientBulkUploadServiceAsyncTest {

  @Autowired OrganizationInitializingService _initService;
  @Autowired PersonService _personService;
  @Autowired AddressValidationService _addressValidationService;
  @Autowired OrganizationService _organizationService;
  @Autowired PatientBulkUploadServiceAsync _service;

  public static final int PATIENT_PAGE_OFFSET = 0;
  public static final int PATIENT_PAGE_SIZE = 1000;

  @BeforeEach
  void setup() {
    _initService.initAll();
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void validPerson_savedToDatabase() throws IOException {
    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");
    byte[] content = inputStream.readAllBytes();

    this._service.savePatients(content, null);
    assertThat(getPatients()).hasSize(1);
  }

  private InputStream loadCsv(String csvFile) {
    return PatientBulkUploadServiceAsyncTest.class.getClassLoader().getResourceAsStream(csvFile);
  }

  private List<Person> getPatients() {
    return this._personService.getPatients(
        null, PATIENT_PAGE_OFFSET, PATIENT_PAGE_SIZE, false, null, false);
  }
}
