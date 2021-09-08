package gov.cdc.usds.simplereport.config;

import com.azure.storage.queue.QueueAsyncClient;
import com.azure.storage.queue.QueueClientBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.properties.AzureStorageQueueReportingProperties;
import gov.cdc.usds.simplereport.service.AzureStorageQueueTestEventReportingService;
import gov.cdc.usds.simplereport.service.TestEventReportingService;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
class AzureTestEventReportingQueueConfiguration {
  @Bean
  @Primary
  @ConditionalOnBean
  TestEventReportingService storageQueueReportingService(
      ObjectMapper mapper, QueueAsyncClient queueClient) {
    return new AzureStorageQueueTestEventReportingService(mapper, queueClient);
  }

  @Bean
  @ConditionalOnMissingBean
  TestEventReportingService noOpReportingService() {
    return new NoOpReportingService();
  }

  @Bean
  @ConditionalOnBean
  QueueAsyncClient queueServiceAsyncClient(AzureStorageQueueReportingProperties properties) {
    return new QueueClientBuilder()
        .connectionString(properties.getConnectionString())
        .buildAsyncClient();
  }

  private static class NoOpReportingService implements TestEventReportingService {
    private static final Logger LOG = LoggerFactory.getLogger(NoOpReportingService.class);

    @Override
    public CompletableFuture<Void> reportAsync(TestEvent testEvent) {
      LOG.warn(
          "No TestEventReportingService configured; defaulting to no-op reporting for TestEvent [{}]",
          testEvent.getInternalId());
      return CompletableFuture.completedFuture(null);
    }

    @Override
    public void markTestEventsAsReported(Set<TestEvent> testEvents) {
      LOG.warn("No TestEventReportingService configured; defaulting to no-op reporting");
    }
  }
}
