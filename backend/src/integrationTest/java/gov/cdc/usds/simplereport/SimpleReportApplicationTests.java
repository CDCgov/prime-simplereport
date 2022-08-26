package gov.cdc.usds.simplereport;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;

@SpringBootTest(
    webEnvironment = WebEnvironment.RANDOM_PORT,
    properties = {"hibernate.query.interceptor.error-level=EXCEPTION"})
public class SimpleReportApplicationTests {

  @Test
  void contextLoads() {
    // no-op
  }
}
