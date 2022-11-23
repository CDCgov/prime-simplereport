package gov.cdc.usds.simplereport.api.uploads;

import static gov.cdc.usds.simplereport.api.uploads.FileUploadController.TEXT_CSV_CONTENT_TYPE;
import static gov.cdc.usds.simplereport.config.WebConfiguration.PATIENT_UPLOAD;
import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.cdc.usds.simplereport.config.DataSourceConfiguration;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.PatientBulkUploadService;
import gov.cdc.usds.simplereport.service.PatientBulkUploadServiceAsync;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.TenantDataAccessService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.io.InputStream;
import java.util.List;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

@Import({DataSourceConfiguration.class})
public class PatientBulkUploadIntegrationTest extends BaseMultiThreadFullStackTest {

  @Autowired PatientBulkUploadServiceAsync _asyncService;
  @Autowired PatientBulkUploadService _patientBulkUploadService;
  @Autowired FileUploadController _fileUploadController;
  @Autowired TenantDataAccessService _accessService;
  @Autowired ApiUserService _userService;
  @Autowired PersonRepository _personRepo;
  @Autowired OrganizationService _orgService;
  @Autowired PersonService _personService;

  @Autowired OrganizationInitializingService _initService;
  @Autowired private MockMvc mockMvc;

  public static final int PATIENT_PAGE_OFFSET = 0;
  public static final int PATIENT_PAGE_SIZE = 1000;

  @BeforeAll
  static void configuration() {
    SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
  }

  @BeforeEach
  void setup() {
    truncateDb();
    _initService.initAll();
  }

  @Test
  // running as standard user weirdly causes an n+1 error about DeviceSpecimenType to throw?
  // apparently the same thing happens when running with a properly configured TenantDataAccess user
  // something about JPA Lazy Loading not being enabled...
  //    @SliceTestConfiguration.WithSimpleReportStandardUser
  @SliceTestConfiguration.WithSimpleReportSiteAdminUserAndOrgAccess
  void validFile_isUploaded() throws Exception {

    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");
    MockMultipartFile file =
        new MockMultipartFile(
            "file", "valid.csv", TEXT_CSV_CONTENT_TYPE, inputStream.readAllBytes());

    // well, we're not breaking now!
    // instead of flaming out on "request not active", we're flaming out once we try to assert on
    // patient size
    // but this part of mockMvc.perform() is working like a champ!
    mockMvc
        .perform(multipart(PATIENT_UPLOAD).file(file).param("rawFacilityId", ""))
        .andExpect(status().isOk())
        .andExpect(content().string("{\"errors\":null,\"status\":\"SUCCESS\"}"));

    // exact error at this point is "An Authentication object was not found in the SecurityContext"
    // this seems true-ish? If we're authenticated as a site admin and trying to check the patients
    // at a specific
    // facility, it tracks that our user wouldn't *actually* be part of an organization
    // so, need to figure out how to add Ruby Reynolds to our organization, even if only temporarily

    // to sum up:
    // we need to be a superadmin user to conduct the patient bulk upload in the first place
    // we need to be associated with an organization to look up patient details
    // easiest thing would be to add Ruby to an organization manaully
    // but how?!

    // adding this breaks the init service
    //        when(mockFacilityRepository.findAllByOrganization(any())).thenReturn(new
    // HashSet<>(_orgService.getFacilities(_orgService.getCurrentOrganization())));
    /*
        * com.yannbriancon.exception.NPlusOneQueriesException: N+1 queries detected on a query for the entity gov.cdc.usds.simplereport.db.model.DeviceSpecimenType
    at gov.cdc.usds.simplereport.service.OrganizationService.getAccessibleFacilities(OrganizationService.java:149)
    Hint: Missing Lazy fetching configuration on a field of one of the entities fetched in the query
        * */

    await().until(patientsAddedToRepository());
    assertThat(getPatients()).hasSize(1);
  }

  private InputStream loadCsv(String csvFile) {
    return PatientBulkUploadIntegrationTest.class.getClassLoader().getResourceAsStream(csvFile);
  }

  private List<Person> getPatients() {
    return _personService.getPatients(
        null, PATIENT_PAGE_OFFSET, PATIENT_PAGE_SIZE, false, null, false);
  }

  // Saving patients is now an asynchronous process - need to wait for it to complete
  private Callable<Boolean> patientsAddedToRepository() {
    return () -> getPatients().size() > 1;
  }
}
