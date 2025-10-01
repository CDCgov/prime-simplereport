package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.config.AimsProperties;
import gov.cdc.usds.simplereport.service.model.S3UploadResponse;
import gov.cdc.usds.simplereport.utils.DateGenerator;
import java.sql.Date;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

@SpringBootTest
@EnableConfigurationProperties
@ActiveProfiles("test")
class AimsReportingServiceTest {
  @Mock private S3Client s3Client;
  @Mock private DateGenerator dateGenerator;
  @Mock private AimsProperties aimsProperties;
  private AimsReportingService aimsReportingService;

  @BeforeEach
  public void setupMocks() {
    when(dateGenerator.newDate())
        .thenReturn(Date.from(LocalDate.of(2025, 6, 1).atStartOfDay().toInstant(ZoneOffset.UTC)));
    when(aimsProperties.getSendingEnvironment()).thenReturn("Test");
    when(aimsProperties.getReceivingEnvironment()).thenReturn("Test");
    when(aimsProperties.getS3BucketName()).thenReturn("BucketName");
    when(aimsProperties.getEncryptionKey()).thenReturn("EncryptionKey");
    when(aimsProperties.getUserId()).thenReturn("UserId");
    aimsReportingService = new AimsReportingService(aimsProperties, dateGenerator, s3Client);
  }

  @Test
  public void sendBatchMessageToAims_success() {
    // GIVEN
    PutObjectResponse putObjectResponse = mock(PutObjectResponse.class, Mockito.RETURNS_DEEP_STUBS);
    when(putObjectResponse.sdkHttpResponse().statusCode()).thenReturn(200);
    when(s3Client.putObject((PutObjectRequest) any(), (RequestBody) any()))
        .thenReturn(putObjectResponse);

    UUID submissionId = UUID.randomUUID();

    // WHEN
    S3UploadResponse response =
        aimsReportingService.sendBatchMessageToAims(submissionId, "BATCH_MESSAGE", 5);

    // THEN
    assertThat(response.getReportId()).isEqualTo(submissionId);
    assertThat(response.getRecordsCount()).isEqualTo(5);
    assertThat(response.isSuccess()).isEqualTo(true);
    assertThat(response.getErrorMessage()).isEqualTo(null);
  }

  @Test
  public void sendBatchMessageToAims_failure() {
    // GIVEN
    PutObjectResponse putObjectResponse = mock(PutObjectResponse.class, Mockito.RETURNS_DEEP_STUBS);
    when(putObjectResponse.sdkHttpResponse().statusCode()).thenReturn(500);
    when(s3Client.putObject((PutObjectRequest) any(), (RequestBody) any()))
        .thenReturn(putObjectResponse);

    UUID submissionId = UUID.randomUUID();

    // WHEN
    S3UploadResponse response =
        aimsReportingService.sendBatchMessageToAims(submissionId, "BATCH_MESSAGE", 5);

    // THEN
    assertThat(response.getReportId()).isEqualTo(submissionId);
    assertThat(response.getRecordsCount()).isEqualTo(5);
    assertThat(response.isSuccess()).isEqualTo(false);
    assertThat(response.getErrorMessage())
        .isEqualTo("Status Code %d: Failed to upload submission %s", 500, submissionId);
  }

  @Test
  public void generateFilename_valid() {
    // GIVEN
    UUID submissionId = UUID.randomUUID();

    // WHEN
    String actualFilename = aimsReportingService.generateFilename(submissionId);

    // THEN
    String expectedFilename =
        String.format(
            "InterPartner~ExpandedELR~Simple-Report~AIMSPlatform~TEST~TEST~20250601000000000~STOP~%s.hl7",
            submissionId);
    assertThat(actualFilename).isEqualTo(expectedFilename);
  }
}
