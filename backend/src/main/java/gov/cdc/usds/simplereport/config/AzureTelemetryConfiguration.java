package gov.cdc.usds.simplereport.config;

import com.microsoft.applicationinsights.TelemetryClient;
import com.microsoft.applicationinsights.TelemetryConfiguration;
import com.microsoft.applicationinsights.extensibility.ContextInitializer;
import com.microsoft.applicationinsights.telemetry.RequestTelemetry;
//import com.microsoft.applicationinsights.extensibility.TelemetryInitializer;
import com.microsoft.applicationinsights.telemetry.Telemetry;
import com.microsoft.applicationinsights.telemetry.TelemetryContext;

import gov.cdc.usds.simplereport.api.CurrentUIVersionContextHolder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

/** Created by nickrobison on 12/16/20 */
@Configuration
public class AzureTelemetryConfiguration {
  @Bean
  @Scope("singleton")
  TelemetryClient getTelemetryClient() {
    /*
    TelemetryConfiguration config = new TelemetryConfiguration();
    config.setConnectionString(System.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING"));
    return new TelemetryClient(config);
    */
    return new TelemetryClient();
  }
}
