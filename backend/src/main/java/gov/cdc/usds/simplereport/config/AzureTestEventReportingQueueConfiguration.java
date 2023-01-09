package gov.cdc.usds.simplereport.config;

import com.azure.storage.queue.QueueAsyncClient;
import com.azure.storage.queue.QueueClientBuilder;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.api.model.TestEventExport;
import gov.cdc.usds.simplereport.api.model.errors.TestEventSerializationFailureException;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.properties.AzureStorageQueueReportingProperties;
import gov.cdc.usds.simplereport.service.AzureStorageQueueTestEventReportingService;
import gov.cdc.usds.simplereport.service.TestEventReportingService;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Slf4j
@Configuration
class AzureTestEventReportingQueueConfiguration {
  @Bean
  @Primary
  @ConditionalOnProperty(
      value = "simple-report.azure-reporting-queue.enabled",
      havingValue = "true")
  TestEventReportingService storageQueueReportingService(
      ObjectMapper mapper, QueueAsyncClient queueClient) {
    log.info("Configured for queue={}", queueClient.getQueueName());
    return new AzureStorageQueueTestEventReportingService(mapper, queueClient);
  }

  @Bean
  @ConditionalOnMissingBean
  TestEventReportingService noOpReportingService() {
    return new NoOpReportingService();
  }

  @Bean
  @ConditionalOnProperty(
      value = "simple-report.azure-reporting-queue.enabled",
      havingValue = "true")
  QueueAsyncClient queueServiceAsyncClient(AzureStorageQueueReportingProperties properties) {
    return new QueueClientBuilder()
        .connectionString(properties.getConnectionString())
        .queueName(properties.getName())
        .buildAsyncClient();
  }

  private static class NoOpReportingService implements TestEventReportingService {
    @Override
    public CompletableFuture<Void> reportAsync(TestEvent testEvent) {
      log.warn(
          "No TestEventReportingService configured; defaulting to no-op reporting for TestEvent [{}]",
          testEvent.getInternalId());
      String buffer = toBuffer(testEvent);
      log.info("TestEvent serializes as: {}", buffer);
      return CompletableFuture.completedFuture(null);
    }

    @Override
    public void markTestEventsAsReported(Set<TestEvent> testEvents) {
      log.warn("No TestEventReportingService configured; defaulting to no-op reporting");
    }

    private String toBuffer(TestEvent testEvent) {
      try {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.writeValueAsString(new TestEventExport(testEvent));
      } catch (JsonProcessingException e) {
        throw new TestEventSerializationFailureException(testEvent.getInternalId(), e.getMessage());
      }
    }
  }
}
