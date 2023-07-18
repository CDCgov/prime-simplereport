package gov.cdc.usds.simplereport.integration;

import static gov.cdc.usds.simplereport.api.uploads.FileUploadController.TEXT_CSV_CONTENT_TYPE;

import gov.cdc.usds.simplereport.api.BaseAuthenticatedFullStackTest;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.utils.BulkUploadResultsToFhirTest;
import gov.cdc.usds.simplereport.utils.TokenAuthentication;
import java.io.InputStream;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

@SliceTestConfiguration.WithSimpleReportStandardUser
@AutoConfigureWireMock(port = 9561)
class UploadTestResultsIntegrationTest extends BaseAuthenticatedFullStackTest {
  @Autowired private MockMvc mockMvc;

  @MockBean TokenAuthentication _tokenAuth;

  @Test
  void CSVUpload() throws Exception {
    InputStream input = loadCsv("testResultUpload/test-results-upload-aoe.csv");
    var file =
        new MockMultipartFile(
            "file", "test-results-upload-aoe.csv", TEXT_CSV_CONTENT_TYPE, input.readAllBytes());

    var responseFile =
        FileUploadTest.class
            .getClassLoader()
            .getResourceAsStream("responses/datahub-response.json");
    assert responseFile != null;
    var mockResponse = IOUtils.toString(responseFile, StandardCharsets.UTF_8);
    stubFor(
        WireMock.post(WireMock.urlEqualTo("/api/reports?processing=async"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.OK.value())
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody(mockResponse)));
    stubFor(
        WireMock.post(
                WireMock.urlEqualTo(
                    "/api/token?scope=simple_report.%2A.report&grant_type=client_credentials&client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.OK.value())
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody("{\"access_token\": \"12345\"}")));
    stubFor(
        WireMock.post(WireMock.urlEqualTo("/api/waters"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.OK.value())
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody(mockResponse)));

    mockMvc.perform(multipart(RESULT_UPLOAD).file(file)).andExpect(status().isOk());
    verify(
        exactly(1),
        postRequestedFor(urlEqualTo("/api/waters"))
            .withRequestBody(equalToJson("{ \"message\": \"Hello\" }", true, true)));
  }

  private InputStream loadCsv(String csvFile) {
    return BulkUploadResultsToFhirTest.class.getClassLoader().getResourceAsStream(csvFile);
  }
}
