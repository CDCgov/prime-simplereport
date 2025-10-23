package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.Pipeline;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.data.auditing.AuditingHandler;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.domain.Page;

class TestResultUploadServiceIntegrationTest extends BaseServiceTest<TestResultUploadService> {

  public static final UUID REPORT_ID_1 = UUID.randomUUID();
  public static final UUID REPORT_ID_2 = UUID.randomUUID();
  public static final UUID REPORT_ID_3 = UUID.randomUUID();
  public static final UUID REPORT_ID_4 = UUID.randomUUID();
  @MockBean DateTimeProvider dateTimeProvider;

  @SpyBean private AuditingHandler handler;

  @Autowired private TestResultUploadRepository uploadRepository;

  @Autowired private OrganizationService organizationService;

  @Autowired private TestResultUploadService testResultUploadService;

  @Autowired private SupportedDiseaseRepository supportedDiseaseRepository;

  @BeforeEach
  void setup() {
    mockCreationTime("2020-01-01 00:00");
    initSampleData();
    Organization currentOrganization = organizationService.getCurrentOrganization();

    mockCreationTime("2020-02-17 00:00");
    uploadRepository.save(
        new TestResultUpload(
            REPORT_ID_1,
            UUID.randomUUID(),
            UploadStatus.SUCCESS,
            30,
            currentOrganization,
            null,
            null,
            Pipeline.COVID,
            null,
            false));

    mockCreationTime("2021-02-17 00:00");
    uploadRepository.save(
        new TestResultUpload(
            REPORT_ID_2,
            UUID.randomUUID(),
            UploadStatus.PENDING,
            20,
            currentOrganization,
            null,
            null,
            Pipeline.UNIVERSAL,
            null,
            null));

    mockCreationTime("2022-02-17 00:00");
    uploadRepository.save(
        new TestResultUpload(
            REPORT_ID_3,
            UUID.randomUUID(),
            UploadStatus.PENDING,
            10,
            currentOrganization,
            null,
            null,
            Pipeline.COVID,
            null,
            null));
  }

  @Test
  void getUploadSubmissions_happy_path() {
    // WHEN
    Page<TestResultUpload> uploadSubmissions =
        testResultUploadService.getUploadSubmissions(null, null, 0, 5);

    // THEN
    assertThat(uploadSubmissions.getTotalElements()).isEqualTo(3);
  }

  @Test
  void getUploadSubmissions_start_date_end_date() {
    // GIVEN
    Date startDate = getDate("2020-02-10 00:00");
    Date endDate = getDate("2021-02-20 00:00");

    // WHEN
    Page<TestResultUpload> uploadSubmissions =
        testResultUploadService.getUploadSubmissions(startDate, endDate, 0, 5);

    // THEN
    assertThat(uploadSubmissions.getTotalElements()).isEqualTo(2);
    assertThat(uploadSubmissions.getContent().get(0).getReportId())
        .isIn(List.of(REPORT_ID_1, REPORT_ID_2));
    assertThat(uploadSubmissions.getContent().get(1).getReportId())
        .isIn(List.of(REPORT_ID_1, REPORT_ID_2));
  }

  @Test
  void getUploadSubmissions_start_date_null() {
    // GIVEN
    Date endDate = getDate("2021-02-16 00:00");

    // WHEN
    Page<TestResultUpload> uploadSubmissions =
        testResultUploadService.getUploadSubmissions(null, endDate, 0, 5);

    // THEN
    assertThat(uploadSubmissions.getTotalElements()).isEqualTo(1);
    assertThat(uploadSubmissions.getContent().get(0).getReportId()).isEqualTo(REPORT_ID_1);
  }

  @Test
  void getUploadSubmissions_end_date_null() {
    // GIVEN
    Date startDate = getDate("2021-02-16 00:00");

    // WHEN
    Page<TestResultUpload> uploadSubmissions =
        testResultUploadService.getUploadSubmissions(startDate, null, 0, 5);

    // THEN
    assertThat(uploadSubmissions.getTotalElements()).isEqualTo(2);
    assertThat(uploadSubmissions.getContent().get(0).getReportId())
        .isIn(List.of(REPORT_ID_2, REPORT_ID_3));
    assertThat(uploadSubmissions.getContent().get(1).getReportId())
        .isIn(List.of(REPORT_ID_2, REPORT_ID_3));
  }

  @Test
  void getUploadSubmissions_doesNotReturnFailed() {
    // GIVEN
    Organization currentOrganization = organizationService.getCurrentOrganization();

    uploadRepository.save(
        new TestResultUpload(
            REPORT_ID_2,
            UUID.randomUUID(),
            UploadStatus.FAILURE,
            20,
            currentOrganization,
            null,
            null,
            Pipeline.COVID,
            null,
            false));

    // WHEN
    Page<TestResultUpload> uploadSubmissions =
        testResultUploadService.getUploadSubmissions(null, null, 0, 5);

    // THEN
    assertThat(uploadSubmissions.getTotalElements()).isEqualTo(3);
    assertThat(uploadSubmissions.getContent().get(0).getReportId()).isNotEqualTo(REPORT_ID_4);
    assertThat(uploadSubmissions.getContent().get(1).getReportId()).isNotEqualTo(REPORT_ID_4);
    assertThat(uploadSubmissions.getContent().get(2).getReportId()).isNotEqualTo(REPORT_ID_4);
  }

  private void mockCreationTime(String date) {
    LocalDateTime localDateTime = getLocalDateTime(date);
    when(dateTimeProvider.getNow()).thenReturn(Optional.of(localDateTime));
    handler.setDateTimeProvider(dateTimeProvider);
  }

  private LocalDateTime getLocalDateTime(String date) {
    return LocalDateTime.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
  }

  private Date getDate(String date) {
    return Date.from(getLocalDateTime(date).atZone(ZoneId.systemDefault()).toInstant());
  }
}
