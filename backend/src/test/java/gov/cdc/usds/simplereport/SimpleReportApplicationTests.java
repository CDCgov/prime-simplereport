package gov.cdc.usds.simplereport;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(
    webEnvironment = WebEnvironment.RANDOM_PORT,
    properties = {"hibernate.query.interceptor.error-level=EXCEPTION"})
@ActiveProfiles("test")
class SimpleReportApplicationTests {

  @Autowired private SimpleReportApplication application;

  @Test
  void contextLoads() {
    assertThat(application).isNotNull();
  }
}
