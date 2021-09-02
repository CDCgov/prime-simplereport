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
  public TelemetryClient getTelemetryClient() {
    // TelemetryConfiguration config = new TelemetryConfiguration();
    // config.setConnectionString(System.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING"));
    // config.getTelemetryInitializers().add(new
    // AzureTelemetryInitializer(_currentUIVersionContextHolder));
    // TelemetryClient client = new TelemetryClient(config);
    // TelemetryConfiguration config = new TelemetryConfiguration();
    TelemetryClient client = new TelemetryClient();
    String instrumentationKey =
        System.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING").split(";")[0].split("=")[1];
    // System.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING");
    client.getContext().setInstrumentationKey(instrumentationKey);
    client.getContext().getProperties().put("HELLO", "WORLD");
    client.trackEvent("Hello world event");
    return client;
  }
}
