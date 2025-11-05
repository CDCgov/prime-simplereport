package gov.cdc.usds.simplereport.integration;

import static org.mockito.Mockito.when;

import com.azure.storage.queue.QueueAsyncClient;
import gov.cdc.usds.simplereport.api.converter.FhirContextProvider;
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
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@TestConfiguration
public class SubmitTestResultTestConfig {
  @MockitoBean DateGenerator dateGenerator;

  @MockitoBean UUIDGenerator uuidGenerator;

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
        FhirContextProvider.get(), queueAsyncClient, new GitProperties(properties), fhirConverter);
  }
}
