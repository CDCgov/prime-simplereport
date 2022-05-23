package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.okta.commons.http.MediaType;
import gov.cdc.usds.simplereport.test_util.WireMockConfig;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.contract.spec.internal.HttpStatus;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"hibernate.query.interceptor.error-level=EXCEPTION"})
@EnableConfigurationProperties
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = {WireMockConfig.class})
public class DatahubClientIntegrationTest {

  @Autowired private WireMockServer wireMockServer;

  @Autowired DataHubClient dataHubClient;

  @BeforeEach()
  void setUp() throws IOException {
    var responseFile =
        DatahubClientIntegrationTest.class
            .getClassLoader()
            .getResourceAsStream("responses/datahub-response.json");
    var mockResponse = IOUtils.toString(responseFile, StandardCharsets.UTF_8);
    wireMockServer.stubFor(
        WireMock.post(WireMock.urlEqualTo("/api/reports"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.OK)
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody(mockResponse)));
  }

  @Test
  void test() {
    var response = dataHubClient.uploadCSV(new byte[] {});
    assertNotNull(response);
    assertEquals(14, response.getReportItemCount());
  }
}
