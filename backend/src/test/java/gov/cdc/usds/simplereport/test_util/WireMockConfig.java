package gov.cdc.usds.simplereport.test_util;

import com.github.tomakehurst.wiremock.WireMockServer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class WireMockConfig {

  @Autowired private WireMockServer wireMockServer;

  @Bean(initMethod = "start", destroyMethod = "stop")
  public WireMockServer mockDatahubService() {
    return new WireMockServer(9561);
  }
}
