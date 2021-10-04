package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.db.model.ReportStreamResponse;
import gov.cdc.usds.simplereport.db.repository.ReportStreamResponseRepository;
import gov.cdc.usds.simplereport.properties.AzureStorageQueueReportingProperties;
import gov.cdc.usds.simplereport.service.ConfiguredReportStreamCallbackService;
import gov.cdc.usds.simplereport.service.ReportStreamCallbackService;
import javax.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class ReportStreamCallbackConfig {
  @Bean(name = "reportStreamCallbackService")
  @ConditionalOnProperty(
      value = "simple-report.azure-reporting-queue.exception-webhook-enabled",
      havingValue = "true")
  ReportStreamCallbackService configuredService(
      AzureStorageQueueReportingProperties properties,
      ReportStreamResponseRepository reportStreamResponseRepository) {
    return new ConfiguredReportStreamCallbackService(
        properties.getExceptionWebhookToken(), reportStreamResponseRepository);
  }

  @Bean(name = "reportStreamCallbackService")
  @ConditionalOnMissingBean
  ReportStreamCallbackService noopService() {
    return new ReportStreamCallbackService() {
      @Override
      public boolean validateCallback(HttpServletRequest request) {
        log.warn("No ReportStreamCallbackService configured; defaulting to no-op reporting");
        return false;
      }

      @Override
      public void log(ReportStreamResponse response) {
        log.warn("No ReportStreamCallbackService configured; defaulting to no-op reporting");
      }
    };
  }
}
