package gov.cdc.usds.simplereport.integration;

import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.equalToJson;
import static com.github.tomakehurst.wiremock.client.WireMock.exactly;
import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.verify;
import static gov.cdc.usds.simplereport.api.uploads.FileUploadController.TEXT_CSV_CONTENT_TYPE;
import static gov.cdc.usds.simplereport.config.WebConfiguration.CONDITION_AGNOSTIC_RESULT_UPLOAD;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.github.tomakehurst.wiremock.client.WireMock;
import com.okta.commons.http.MediaType;
import gov.cdc.usds.simplereport.api.BaseAuthenticatedFullStackTest;
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
import java.util.Objects;
import java.util.Properties;
import java.util.UUID;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.GitProperties;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

@SliceTestConfiguration.WithSimpleReportStandardUser
@AutoConfigureWireMock(port = 9561)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class UploadConditionAgnosticResultsIntegrationTest extends BaseAuthenticatedFullStackTest {
  @Autowired private MockMvc mockMvc;

  @MockBean private TokenAuthentication _tokenAuth;

  @MockBean private DateGenerator dateGenerator;

  @MockBean private UUIDGenerator uuidGenerator;

  @SpyBean private BulkUploadResultsToFhir bulkUploadResultsToFhir;

  @BeforeEach
  void setup() throws IOException {
    Date date = Date.from(Instant.parse("2023-05-24T19:33:06.472Z"));
    when(dateGenerator.newDate()).thenReturn(date);
    when(uuidGenerator.randomUUID())
        .thenReturn(UUID.fromString("5c5cc8fd-7001-4ac2-9340-541d065eca87"));

    var properties = new Properties();
    // short commit id
    properties.setProperty("commit.id.abbrev", "CommitID");
    properties.setProperty("commit.time", "1688565766");
    ReflectionTestUtils.setField(
        bulkUploadResultsToFhir, "gitProperties", new GitProperties(properties));

    var responseFile =
        getClass().getClassLoader().getResourceAsStream("responses/datahub-response.json");

    var mockResponse = IOUtils.toString(responseFile, StandardCharsets.UTF_8);

    // gets auth token
    stubFor(
        WireMock.post(urlEqualTo("/api/token"))
            .withRequestBody(
                equalTo(
                    "scope=simple_report.*.report&grant_type=client_credentials&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion=null"))
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

  @Test
  void CSVUpload() throws Exception {

    var sampleFhirMessage =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass()
                    .getClassLoader()
                    .getResourceAsStream(
                        "fhir/condition-agnostic-bundles-upload-integration-testing.ndjson")),
            StandardCharsets.UTF_8);

    InputStream input = loadCsv("conditionAgnosticUpload/happy-path.csv");
    var file =
        new MockMultipartFile(
            "file", "happy-path.csv", TEXT_CSV_CONTENT_TYPE, input.readAllBytes());

    mockMvc
        .perform(multipart(CONDITION_AGNOSTIC_RESULT_UPLOAD).file(file))
        .andExpect(status().isOk());

    verify(
        exactly(1),
        postRequestedFor(urlEqualTo("/api/waters"))
            .withRequestBody(equalToJson(sampleFhirMessage, false, false)));
  }

  @Test
  void CSVUploadIntentionallyBlankName() throws Exception {
    var sampleFhirMessage =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass()
                    .getClassLoader()
                    .getResourceAsStream(
                        "fhir/condition-agnostic-intentionally-absent-name.ndjson")),
            StandardCharsets.UTF_8);

    InputStream input = loadCsv("conditionAgnosticUpload/missing-name.csv");
    var file =
        new MockMultipartFile(
            "file", "missing-name.csv", TEXT_CSV_CONTENT_TYPE, input.readAllBytes());

    mockMvc
        .perform(multipart(CONDITION_AGNOSTIC_RESULT_UPLOAD).file(file))
        .andExpect(status().isOk());

    verify(
        exactly(1),
        postRequestedFor(urlEqualTo("/api/waters"))
            .withRequestBody(equalToJson(sampleFhirMessage, false, false)));
  }

  private InputStream loadCsv(String csvFile) {
    return BulkUploadResultsToFhirTest.class.getClassLoader().getResourceAsStream(csvFile);
  }
}
