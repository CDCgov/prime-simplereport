package gov.cdc.usds.simplereport;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(
    webEnvironment = WebEnvironment.RANDOM_PORT,
    properties = {"hibernate.query.interceptor.error-level=EXCEPTION"})
@TestPropertySource(properties = {"TWILIO_ACCOUNT_SID=foo"})
public class SimpleReportApplicationTests {

  //  static {
  //    System.setProperty("TWILIO_ACCOUNT_SID", "foo");
  //  }

  @Test
  void contextLoads() {
    // no-op
  }
}
