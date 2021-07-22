package gov.cdc.usds.simplereport.config;

import com.microsoft.applicationinsights.TelemetryClient;
import com.microsoft.applicationinsights.TelemetryConfiguration;

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
     config.setConnectionString(System.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING"));
    // config.getTelemetryInitializers().add(new AzureTelemetryInitializer(_currentUIVersionContextHolder));
    TelemetryClient client = new TelemetryClient(config);
    //TelemetryClient client = new TelemetryClient();
    System.out.println("============================");
    System.out.println(System.getenv("APPINSIGHTS_INSTRUMENTATIONKEY"));
    System.out.println(System.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING"));
    System.out.println("============================");
    client.getContext().getProperties().put("HELLO", "WORLD");
    return client;
  }
}
