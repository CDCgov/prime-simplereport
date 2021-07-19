package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.config.AzureTelemetryInitializer;
import com.microsoft.applicationinsights.TelemetryClient;
import com.microsoft.applicationinsights.TelemetryConfiguration;
import com.microsoft.applicationinsights.extensibility.TelemetryInitializer;
import com.microsoft.applicationinsights.telemetry.Telemetry;
import gov.cdc.usds.simplereport.api.CurrentUIVersionContextHolder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

/** Created by nickrobison on 12/16/20 */
@Configuration
public class AzureTelemetryConfiguration {
  private final CurrentUIVersionContextHolder _currentUIVersionContextHolder;

  AzureTelemetryConfiguration(CurrentUIVersionContextHolder currentUIVersionContextHolder) {
    _currentUIVersionContextHolder = currentUIVersionContextHolder;
  }

  @Bean
  @Scope("singleton")
  TelemetryClient getTelemetryClient() {
    TelemetryClient client = new TelemetryClient();
    TelemetryConfiguration.getActiveWithoutInitializingConfig().getTelemetryInitializers().add(new AzureTelemetryInitializer(_currentUIVersionContextHolder));
    return client;
  }
}