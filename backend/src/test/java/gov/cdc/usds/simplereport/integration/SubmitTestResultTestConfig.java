package gov.cdc.usds.simplereport.integration;

import com.azure.storage.queue.QueueAsyncClient;
import gov.cdc.usds.simplereport.api.converter.FhirContextProvider;
import gov.cdc.usds.simplereport.api.converter.FhirConverter;
import gov.cdc.usds.simplereport.service.AzureStorageQueueFhirReportingService;
import gov.cdc.usds.simplereport.service.TestEventReportingService;
import gov.cdc.usds.simplereport.utils.DateGenerator;
import gov.cdc.usds.simplereport.utils.UUIDGenerator;
import java.util.Properties;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.info.GitProperties;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class SubmitTestResultTestConfig {
  @Bean("fhirQueueReportingService")
  TestEventReportingService fhirQueueReportingService(
      @Qualifier("mockClient") QueueAsyncClient queueAsyncClient,
      DateGenerator dateGenerator,
      UUIDGenerator uuidGenerator) {
    var properties = new Properties();
    // short commit id
    properties.setProperty("commit.id.abbrev", "CommitID");
    properties.setProperty("commit.time", "1688565766");

    FhirConverter fhirConverter = new FhirConverter(uuidGenerator, dateGenerator);

    return new AzureStorageQueueFhirReportingService(
        FhirContextProvider.get(), queueAsyncClient, new GitProperties(properties), fhirConverter);
  }
}
