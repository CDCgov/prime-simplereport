package gov.cdc.usds.simplereport.integration;

import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.reset;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.github.tomakehurst.wiremock.client.WireMock;
import com.okta.commons.http.MediaType;
import gov.cdc.usds.simplereport.api.BaseAuthenticatedFullStackTest;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.utils.BulkUploadResultsToFhir;
import gov.cdc.usds.simplereport.utils.BulkUploadResultsToFhirTest;
import gov.cdc.usds.simplereport.utils.DateGenerator;
import gov.cdc.usds.simplereport.utils.TokenAuthentication;
import gov.cdc.usds.simplereport.utils.UUIDGenerator;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Properties;
import java.util.UUID;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.GitProperties;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

@SliceTestConfiguration.WithSimpleReportStandardUser
@AutoConfigureWireMock(port = 9561)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SuppressWarnings({"checkstyle:TodoComment"})
class UploadTestResultsIntegrationTest extends BaseAuthenticatedFullStackTest {
  @Autowired private MockMvc mockMvc;

  @MockitoBean private TokenAuthentication _tokenAuth;

  @MockitoBean private DateGenerator dateGenerator;

  @MockitoBean private FeatureFlagsConfig featureFlagsConfig;

  @MockitoBean private UUIDGenerator uuidGenerator;

  @MockitoSpyBean private BulkUploadResultsToFhir bulkUploadResultsToFhir;

  @BeforeEach
  void setup() throws IOException {
    Date date = Date.from(Instant.parse("2023-05-24T19:33:06.472Z"));
    when(featureFlagsConfig.isAimsReportingEnabled()).thenReturn(false);
    when(dateGenerator.newDate()).thenReturn(date);
    when(uuidGenerator.randomUUID())
        .thenReturn(UUID.fromString("5c5cc8fd-7001-4ac2-9340-541d065eca87"));

    var properties = new Properties();
    // short commit id
    properties.setProperty("commit.id.abbrev", "CommitID");
    properties.setProperty("commit.time", "1688565766");
    ReflectionTestUtils.setField(
        bulkUploadResultsToFhir, "gitProperties", new GitProperties(properties));
    when(_tokenAuth.createRSAJWT(any(), any(), any(), any())).thenReturn("generatedToken");

    var responseFile =
        getClass().getClassLoader().getResourceAsStream("responses/datahub-response.json");

    var mockResponse = IOUtils.toString(responseFile, StandardCharsets.UTF_8);

    // gets auth token
    stubFor(
        WireMock.post(urlEqualTo("/api/token"))
            .withRequestBody(
                equalTo(
                    "scope=simple_report.*.report&grant_type=client_credentials&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion=generatedToken"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.OK.value())
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody("{\"access_token\": \"12345\"}")));

    // submits the FHIR bundles
    stubFor(
        WireMock.post(urlEqualTo("/api/waters"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.OK.value())
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody(mockResponse)));
  }

  @AfterEach
  void clearMocks() {
    reset();
  }

  // TODO: These tests should be cleaned up now that ReportStream is disabled
  //  @Test
  //  void CSVUpload_ToUniversalPipeline_Succeeds() throws Exception {
  //    var sampleFhirMessage =
  //        IOUtils.toString(
  //            Objects.requireNonNull(
  //                getClass()
  //                    .getClassLoader()
  //                    .getResourceAsStream("fhir/bundles-upload-integration-testing.ndjson")),
  //            StandardCharsets.UTF_8);
  //
  //    InputStream input = loadCsv("testResultUpload/test-results-upload-integration.csv");
  //    var file =
  //        new MockMultipartFile(
  //            "file",
  //            "test-results-upload-integration.csv",
  //            TEXT_CSV_CONTENT_TYPE,
  //            input.readAllBytes());
  //
  //    var universalJsonMatch =
  //        IOUtils.toString(
  //            Objects.requireNonNull(
  //                getClass()
  //                    .getClassLoader()
  //                    .getResourceAsStream(
  //                        "testResultUpload/upload-test-results-universal-partial-match.txt")),
  //            StandardCharsets.UTF_8);
  //
  //    mockMvc
  //        .perform(multipart(RESULT_UPLOAD).file(file))
  //        .andExpect(status().isOk())
  //        .andExpect(content().string(containsString(universalJsonMatch)));
  //
  //    verify(
  //        exactly(1),
  //        postRequestedFor(urlEqualTo("/api/waters"))
  //            .withRequestBody(equalToJson(sampleFhirMessage, false, false)));
  //    verify(exactly(0), postRequestedFor(urlEqualTo("/api/reports?processing=async")));
  //  }
  //
  //  @Test
  //  void CSVUpload_Returns200_WhenFailsUniversalPipelineWith_ParseableFailure() throws Exception {
  //    var responseFile =
  //        getClass()
  //            .getClassLoader()
  //            .getResourceAsStream("responses/datahub-parseable-error-response.json");
  //
  //    var mockResponse = IOUtils.toString(responseFile, StandardCharsets.UTF_8);
  //
  //    // submits the FHIR bundles to universal pipeline
  //    stubFor(
  //        WireMock.post(urlEqualTo("/api/waters"))
  //            .willReturn(
  //                WireMock.aResponse()
  //                    .withStatus(HttpStatus.BAD_REQUEST.value())
  //                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
  //                    .withBody(mockResponse)));
  //
  //    var sampleFhirMessage =
  //        IOUtils.toString(
  //            Objects.requireNonNull(
  //                getClass()
  //                    .getClassLoader()
  //                    .getResourceAsStream("fhir/bundles-upload-integration-testing.ndjson")),
  //            StandardCharsets.UTF_8);
  //
  //    InputStream input = loadCsv("testResultUpload/test-results-upload-integration.csv");
  //    var file =
  //        new MockMultipartFile(
  //            "file",
  //            "test-results-upload-integration.csv",
  //            TEXT_CSV_CONTENT_TYPE,
  //            input.readAllBytes());
  //
  //    mockMvc
  //        .perform(multipart(RESULT_UPLOAD).file(file))
  //        .andExpect(status().isOk())
  //        .andExpect(jsonPath("$[?(@.destination == 'UNIVERSAL')].status").value("FAILURE"))
  //        .andExpect(jsonPath("$[?(@.destination == 'UNIVERSAL')].recordsCount").value(0))
  //        .andExpect(jsonPath("$[?(@.destination == 'UNIVERSAL')].errors.length()").value(6));
  //
  //    verify(
  //        exactly(1),
  //        postRequestedFor(urlEqualTo("/api/waters"))
  //            .withRequestBody(equalToJson(sampleFhirMessage, false, false)));
  //    verify(exactly(0), postRequestedFor(urlEqualTo("/api/reports?processing=async")));
  //  }
  //
  //  @Test
  //  void CSVUpload_Returns200_WhenSucceedsUniversalPipeline() throws Exception {
  //
  //    var sampleFhirMessage =
  //        IOUtils.toString(
  //            Objects.requireNonNull(
  //                getClass()
  //                    .getClassLoader()
  //                    .getResourceAsStream("fhir/bundles-upload-integration-testing.ndjson")),
  //            StandardCharsets.UTF_8);
  //
  //    InputStream input = loadCsv("testResultUpload/test-results-upload-integration.csv");
  //    var file =
  //        new MockMultipartFile(
  //            "file",
  //            "test-results-upload-integration.csv",
  //            TEXT_CSV_CONTENT_TYPE,
  //            input.readAllBytes());
  //
  //    mockMvc
  //        .perform(multipart(RESULT_UPLOAD).file(file))
  //        .andExpect(status().isOk())
  //        .andExpect(jsonPath("$[?(@.destination == 'UNIVERSAL')].status").value("PENDING"))
  //        .andExpect(jsonPath("$[?(@.destination == 'UNIVERSAL')].recordsCount").value(14))
  //        .andExpect(jsonPath("$[?(@.destination == 'UNIVERSAL')].errors.length()").value(0));
  //
  //    verify(
  //        exactly(1),
  //        postRequestedFor(urlEqualTo("/api/waters"))
  //            .withRequestBody(equalToJson(sampleFhirMessage, false, false)));
  //    verify(exactly(0), postRequestedFor(urlEqualTo("/api/reports?processing=async")));
  //  }
  //
  //  @Test
  //  void CSVUpload_Returns400_FailsUniversalPipelineWith_UnparseableFailure() throws Exception {
  //
  //    // submits the FHIR bundles to universal pipeline
  //    stubFor(
  //        WireMock.post(urlEqualTo("/api/waters"))
  //            .willReturn(
  //                WireMock.aResponse()
  //                    .withStatus(HttpStatus.BAD_REQUEST.value())
  //                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
  //                    .withBody("this is unparseable")));
  //
  //    var sampleFhirMessage =
  //        IOUtils.toString(
  //            Objects.requireNonNull(
  //                getClass()
  //                    .getClassLoader()
  //                    .getResourceAsStream("fhir/bundles-upload-integration-testing.ndjson")),
  //            StandardCharsets.UTF_8);
  //
  //    InputStream input = loadCsv("testResultUpload/test-results-upload-integration.csv");
  //    var file =
  //        new MockMultipartFile(
  //            "file",
  //            "test-results-upload-integration.csv",
  //            TEXT_CSV_CONTENT_TYPE,
  //            input.readAllBytes());
  //
  //    mockMvc
  //        .perform(multipart(RESULT_UPLOAD).file(file))
  //        .andExpect(status().isBadRequest())
  //        .andExpect(content().string(""));
  //
  //    verify(
  //        exactly(1),
  //        postRequestedFor(urlEqualTo("/api/waters"))
  //            .withRequestBody(equalToJson(sampleFhirMessage, false, false)));
  //    verify(exactly(0), postRequestedFor(urlEqualTo("/api/reports?processing=async")));
  //  }

  private InputStream loadCsv(String csvFile) {
    return BulkUploadResultsToFhirTest.class.getClassLoader().getResourceAsStream(csvFile);
  }
}
