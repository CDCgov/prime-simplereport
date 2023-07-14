package gov.cdc.usds.simplereport.integration;

import static org.mockito.Mockito.when;

import ca.uhn.fhir.context.FhirContext;
import com.azure.storage.queue.QueueAsyncClient;
import gov.cdc.usds.simplereport.api.converter.FhirConverter;
import gov.cdc.usds.simplereport.service.AzureStorageQueueFhirReportingService;
import gov.cdc.usds.simplereport.service.TestEventReportingService;
import gov.cdc.usds.simplereport.utils.DateGenerator;
import gov.cdc.usds.simplereport.utils.UUIDGenerator;
import java.time.Instant;
import java.util.Date;
import java.util.Properties;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.info.GitProperties;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class SubmitTestResultTestConfig {
  @MockBean DateGenerator dateGenerator;

  @MockBean UUIDGenerator uuidGenerator;

  @Bean("fhirQueueReportingService")
  TestEventReportingService fhirQueueReportingService(
      @Qualifier("mockClient") QueueAsyncClient queueAsyncClient) {
    var properties = new Properties();
    // short commit id
    properties.setProperty("commit.id.abbrev", "CommitID");
    properties.setProperty("commit.time", "1688565766");

    Date date = Date.from(Instant.parse("2023-05-24T19:33:06.472Z"));
    when(dateGenerator.newDate()).thenReturn(date);
    when(uuidGenerator.randomUUID()).thenReturn(UUID.randomUUID());

    FhirConverter fhirConverter = new FhirConverter(uuidGenerator, dateGenerator);

    return new AzureStorageQueueFhirReportingService(
        new FhirContext(), queueAsyncClient, new GitProperties(properties), fhirConverter);
  }
}
