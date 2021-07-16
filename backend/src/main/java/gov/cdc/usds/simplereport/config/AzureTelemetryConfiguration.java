package gov.cdc.usds.simplereport.config;

import com.microsoft.applicationinsights.TelemetryClient;
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
    return new TelemetryClient();
  }

  @Bean
  TelemetryInitializer getTelemetryInitializer() {
    return (Telemetry telemetry) -> {
      var telemetryProperties = telemetry.getProperties();
      telemetryProperties.put("HELLO", "WORLD");
      if (_currentUIVersionContextHolder.getUiShaFromHeaders() != null) {
        telemetryProperties.put("UI Version", _currentUIVersionContextHolder.getUiShaFromHeaders());
      }
    };
  }
}
