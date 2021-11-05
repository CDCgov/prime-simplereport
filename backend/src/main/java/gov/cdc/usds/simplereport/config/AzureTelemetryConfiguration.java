package gov.cdc.usds.simplereport.config;

import com.microsoft.applicationinsights.TelemetryClient;
import com.microsoft.applicationinsights.TelemetryConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

/** Created by nickrobison on 12/16/20 */
@Configuration
public class AzureTelemetryConfiguration {

  @Bean
  @Scope("singleton")
  TelemetryClient getTelemetryClient() {
    TelemetryConfiguration config = TelemetryConfiguration.createDefault();
    String connectionString = System.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING");
    if (connectionString != null) {
      config.setConnectionString(connectionString);
    }
    return new TelemetryClient(config);
  }
}
