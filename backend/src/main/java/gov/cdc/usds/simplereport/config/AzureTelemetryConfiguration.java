package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.config.AzureTelemetryInitializer;
import com.microsoft.applicationinsights.TelemetryClient;
import com.microsoft.applicationinsights.TelemetryConfiguration;
import com.microsoft.applicationinsights.extensibility.TelemetryInitializer;
import com.microsoft.applicationinsights.telemetry.RequestTelemetry;
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
    TelemetryConfiguration config = new TelemetryConfiguration();
    config.getTelemetryInitializers().add(new AzureTelemetryInitializer(_currentUIVersionContextHolder));
    //config.setInstrumentationKey(System.getenv("APPINSIGHTS_INSTRUMENTATIONKEY"));
    TelemetryClient client = new TelemetryClient(config);
    client.getContext().setInstrumentationKey(System.getenv("APPINSIGHTS_INSTRUMENTATIONKEY"));
    client.getContext().getProperties().put("HI", "MOM");
    return client;
  }
}