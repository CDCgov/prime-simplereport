package gov.cdc.usds.simplereport;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;

@SpringBootTest(
    webEnvironment = WebEnvironment.RANDOM_PORT,
    properties = {"hibernate.query.interceptor.error-level=EXCEPTION"})
public class SimpleReportApplicationTests {

  @Autowired private SimpleReportApplication application;

  @Test
  void contextLoads() {
    assertThat(application).isNotNull();
  }
}
