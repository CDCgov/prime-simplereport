package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.utils.CSVGeneratorUtils.generateEmailCSVInBytes;
import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.Test;

class CSVGeneratorUtilsTest {
  @Test
  void generateEmailCSVInBytes_withEmails() {
    List<String> emails =
        List.of("fake-1@example.com", "fake.2@example.com", "fake.THREE+3@example.com");
    byte[] emailsBytes = generateEmailCSVInBytes(emails);
    String bytesToString = new String(emailsBytes, StandardCharsets.UTF_8);
    String expectedString =
        "email\nfake-1@example.com\nfake.2@example.com\nfake.THREE+3@example.com\n";
    assertThat(bytesToString).isEqualTo(expectedString);
  }

  @Test
  void generateEmailCSVInBytes_withNoEmails() {
    List<String> emails = List.of();
    byte[] emailsBytes = generateEmailCSVInBytes(emails);
    String bytesToString = new String(emailsBytes, StandardCharsets.UTF_8);
    String expectedString = "email\n";
    assertThat(bytesToString).isEqualTo(expectedString);
  }
}
