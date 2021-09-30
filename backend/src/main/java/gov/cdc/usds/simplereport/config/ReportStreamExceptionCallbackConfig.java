package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.db.model.ReportStreamException;
import gov.cdc.usds.simplereport.db.repository.ReportStreamExceptionRepository;
import gov.cdc.usds.simplereport.properties.AzureStorageQueueReportingProperties;
import gov.cdc.usds.simplereport.service.ConfiguredReportStreamExceptionCallbackService;
import gov.cdc.usds.simplereport.service.ReportStreamExceptionCallbackService;
import javax.servlet.http.HttpServletRequest;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ReportStreamExceptionCallbackConfig {
  @Bean(name = "reportStreamExceptionCallbackService")
  @ConditionalOnProperty(value = "simple-report.azure-reporting-queue.exception-callback-token")
  ReportStreamExceptionCallbackService configuredService(
      AzureStorageQueueReportingProperties properties,
      ReportStreamExceptionRepository reportStreamExceptionRepository) {
    return new ConfiguredReportStreamExceptionCallbackService(
        properties.getExceptionCallbackToken(), reportStreamExceptionRepository);
  }

  @Bean(name = "reportStreamExceptionCallbackService")
  @ConditionalOnMissingBean
  ReportStreamExceptionCallbackService noopService() {
    return new ReportStreamExceptionCallbackService() {
      @Override
      public boolean validateCallback(HttpServletRequest request) {
        return false;
      }

      @Override
      public void log(ReportStreamException exception) {}
    };
  }
}
