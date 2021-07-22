package gov.cdc.usds.simplereport.config;

import com.microsoft.applicationinsights.TelemetryClient;
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
    // TelemetryConfiguration config = new TelemetryConfiguration();
    // config.getTelemetryInitializers().add(new
    // AzureTelemetryInitializer(_currentUIVersionContextHolder));
    // TelemetryClient client = new TelemetryClient(config);
    // client.getContext().setInstrumentationKey(System.getenv("APPINSIGHTS_INSTRUMENTATIONKEY"));
    TelemetryClient client = new TelemetryClient();
    client.getContext().getProperties().put("HELLO", "WORLD");
    return client;
  }
}
