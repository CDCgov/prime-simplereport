package gov.cdc.usds.simplereport.service;

import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.github.tomakehurst.wiremock.client.WireMock;
import com.okta.commons.http.MediaType;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.contract.spec.internal.HttpStatus;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@EnableConfigurationProperties
@ExtendWith(SpringExtension.class)
@AutoConfigureWireMock(port = 9561)
class TestResultUploadServiceTest extends BaseServiceTest<TestResultUploadService> {

  @BeforeEach()
  public void init() {
    initSampleData();
  }

  @Test
  @DirtiesContext
  @SliceTestConfiguration.WithSimpleReportCsvUploadPilotUser
  void integrationTest_returnsSuccessfulResult() throws IOException {
    var responseFile =
        TestResultUploadServiceTest.class
            .getClassLoader()
            .getResourceAsStream("responses/datahub-response.json");
    var mockResponse = IOUtils.toString(responseFile, StandardCharsets.UTF_8);
    stubFor(
        WireMock.post(WireMock.urlEqualTo("/api/reports"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.OK)
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody(mockResponse)));
    InputStream input = loadCsv("test-upload-test-results.csv");

    var output = this._service.processResultCSV(input);
    assertEquals(UploadStatus.PENDING, output.getStatus());
    assertEquals(14, output.getRecordsCount());
    assertNotNull(output.getOrganization());

    var warningMessage = Arrays.stream(output.getWarnings()).findFirst().get();
    assertNotNull(warningMessage.getMessage());
    assertNotNull(warningMessage.getScope());
    assertEquals(0, output.getErrors().length);

    assertNotNull(output.getCreatedAt());
    assertNotNull(output.getUpdatedAt());
    assertNotNull(output.getInternalId());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportCsvUploadPilotUser
  void ioException_CaughtAndThrowsCsvException() throws IOException {

    var input = mock(InputStream.class);
    when(input.readAllBytes()).thenThrow(IOException.class);

    assertThrows(
        CsvProcessingException.class,
        () -> {
          this._service.processResultCSV(input);
        });
  }

  @Test
  @DirtiesContext
  @SliceTestConfiguration.WithSimpleReportCsvUploadPilotUser
  void feignBadRequest_returnsErrorMessage() throws IOException {

    stubFor(
        WireMock.post(WireMock.urlEqualTo("/api/reports"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.BAD_REQUEST)
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody("you messed up")));
    InputStream input = mock(InputStream.class);
    when(input.readAllBytes()).thenReturn(new byte[] {45});

    var response = this._service.processResultCSV(input);

    assertEquals(1, response.getErrors().length);
    var errorMessage = Arrays.stream(response.getErrors()).findFirst().get();

    assertEquals("Bad Request", errorMessage.getMessage());
  }

  @Test
  @DirtiesContext
  @SliceTestConfiguration.WithSimpleReportCsvUploadPilotUser
  void feignGeneralError_returnsGenericErrorMessage() throws IOException {

    stubFor(
        WireMock.post(WireMock.urlEqualTo("/api/reports"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody("you messed up")));
    InputStream input = mock(InputStream.class);
    when(input.readAllBytes()).thenReturn(new byte[] {45});

    var response = this._service.processResultCSV(input);

    assertEquals(1, response.getErrors().length);
    var errorMessage = Arrays.stream(response.getErrors()).findFirst().get();

    assertEquals("Server Error", errorMessage.getMessage());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void unauthorizedUser_NotAuthorizedResponse() {
    InputStream input = loadCsv("test-upload-test-results.csv");
    assertThrows(
        AccessDeniedException.class,
        () -> {
          this._service.processResultCSV(input);
        });
  }

  private InputStream loadCsv(String csvFile) {
    return TestResultUploadService.class.getClassLoader().getResourceAsStream(csvFile);
  }
}
