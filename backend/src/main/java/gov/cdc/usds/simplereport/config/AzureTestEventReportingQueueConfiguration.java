package gov.cdc.usds.simplereport.config;

import static gov.cdc.usds.simplereport.config.BeanProfiles.PROD;

import ca.uhn.fhir.context.FhirContext;
import com.azure.storage.queue.QueueAsyncClient;
import com.azure.storage.queue.QueueClientBuilder;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.api.converter.FhirContextProvider;
import gov.cdc.usds.simplereport.api.converter.FhirConverter;
import gov.cdc.usds.simplereport.api.model.TestEventExport;
import gov.cdc.usds.simplereport.api.model.errors.TestEventSerializationFailureException;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.properties.AzureStorageQueueReportingProperties;
import gov.cdc.usds.simplereport.service.AzureStorageQueueFhirReportingService;
import gov.cdc.usds.simplereport.service.AzureStorageQueueTestEventReportingService;
import gov.cdc.usds.simplereport.service.TestEventReportingService;
import java.util.concurrent.CompletableFuture;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.info.GitProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

@Slf4j
@Configuration
class AzureTestEventReportingQueueConfiguration {
  @Bean("csvQueueReportingService")
  @ConditionalOnProperty(
      value = "simple-report.azure-reporting-queue.enabled",
      havingValue = "true")
  TestEventReportingService storageQueueReportingService(
      ObjectMapper mapper, @Qualifier("csvQueue") QueueAsyncClient queueClient) {
    log.info("Configured for queue={}", queueClient.getQueueName());
    return new AzureStorageQueueTestEventReportingService(mapper, queueClient);
  }

  @Bean("fhirQueueReportingService")
  @ConditionalOnProperty(
      value = "simple-report.azure-reporting-queue.fhir-queue-enabled",
      havingValue = "true")
  TestEventReportingService fhirQueueReportingService(
      FhirContext context,
      @Qualifier("fhirQueueClient") QueueAsyncClient queueClient,
      GitProperties gitProperties,
      FhirConverter fhirConverter) {
    log.info("Configured for queue={}", queueClient.getQueueName());
    return new AzureStorageQueueFhirReportingService(
        context, queueClient, gitProperties, fhirConverter);
  }

  @Bean
  FhirContext fhirContext() {
    return FhirContextProvider.get();
  }

  @Profile(PROD)
  @Primary
  @Bean(name = "csvQueueReportingService")
  @ConditionalOnMissingBean(name = "csvQueueReportingService")
  TestEventReportingService noOpCSVReportingService() {
    return NoOpCovidReportingService.builder().build();
  }

  @Profile(PROD)
  @Bean(name = "fhirQueueReportingService")
  @ConditionalOnMissingBean(name = "fhirQueueReportingService")
  TestEventReportingService noOpFhirReportingService(
      FhirContext context, GitProperties gitProperties, FhirConverter fhirConverter) {
    return NoOpFHIRReportingService.builder()
        .fhirContext(context)
        .gitProperties(gitProperties)
        .fhirConverter(fhirConverter)
        .build();
  }

  @Profile("!" + PROD)
  @Primary
  @Bean(name = "csvQueueReportingService")
  @ConditionalOnMissingBean(name = "csvQueueReportingService")
  TestEventReportingService noOpDebugCSVReportingService() {
    return NoOpCovidReportingService.builder().printSerializedTestEvent(true).build();
  }

  @Profile("!" + PROD)
  @Bean(name = "fhirQueueReportingService")
  @ConditionalOnMissingBean(name = "fhirQueueReportingService")
  TestEventReportingService noOpDebugFhirReportingService(
      FhirContext context, GitProperties gitProperties, FhirConverter fhirConverter) {
    return NoOpFHIRReportingService.builder()
        .fhirContext(context)
        .gitProperties(gitProperties)
        .fhirConverter(fhirConverter)
        .printSerializedTestEvent(true)
        .build();
  }

  @Bean("csvQueue")
  @ConditionalOnProperty(
      value = "simple-report.azure-reporting-queue.enabled",
      havingValue = "true")
  QueueAsyncClient queueServiceAsyncClient(AzureStorageQueueReportingProperties properties) {
    return new QueueClientBuilder()
        .connectionString(properties.getConnectionString())
        .queueName(properties.getName())
        .buildAsyncClient();
  }

  @Bean("fhirQueueClient")
  @ConditionalOnProperty(
      value = "simple-report.azure-reporting-queue.fhir-queue-enabled",
      havingValue = "true")
  QueueAsyncClient fhirQueueServiceAsyncClient(AzureStorageQueueReportingProperties properties) {
    return new QueueClientBuilder()
        .connectionString(properties.getConnectionString())
        .queueName(properties.getFhirQueueName())
        .buildAsyncClient();
  }

  @Builder
  static class NoOpCovidReportingService implements TestEventReportingService {

    @Builder.Default private boolean printSerializedTestEvent = false;

    @Override
    public CompletableFuture<Void> reportAsync(TestEvent testEvent) {
      log.warn(
          "No Covid TestEventReportingService configured; defaulting to no-op reporting for TestEvent [{}]",
          testEvent.getInternalId());

      if (printSerializedTestEvent) {
        log.info("TestEvent serializes as: {}", toBuffer(testEvent));
      }
      return CompletableFuture.completedFuture(null);
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

  @Builder
  static class NoOpFHIRReportingService implements TestEventReportingService {

    @Builder.Default private boolean printSerializedTestEvent = false;

    private FhirContext fhirContext;
    private GitProperties gitProperties;
    private FhirConverter fhirConverter;

    @Override
    public CompletableFuture<Void> reportAsync(TestEvent testEvent) {
      log.warn(
          "No FHIR TestEventReportingService configured; defaulting to no-op reporting for TestEvent [{}]",
          testEvent.getInternalId());

      if (printSerializedTestEvent) {
        log.info("TestEvent bundled as: {}", toBuffer(testEvent));
      }
      return CompletableFuture.completedFuture(null);
    }

    private String toBuffer(TestEvent testEvent) {
      return fhirContext
          .newJsonParser()
          .encodeResourceToString(fhirConverter.createFhirBundle(testEvent, gitProperties, "P"));
    }
  }
}
