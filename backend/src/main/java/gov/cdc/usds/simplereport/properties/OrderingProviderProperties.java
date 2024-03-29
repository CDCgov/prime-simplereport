package gov.cdc.usds.simplereport.properties;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "simple-report.ordering-providers")
public class OrderingProviderProperties {
  private final List<String> statesNotRequired;

  public OrderingProviderProperties(List<String> statesNotRequired) {
    this.statesNotRequired =
        statesNotRequired.stream().map(String::toUpperCase).collect(Collectors.toList());
  }

  public List<String> getStatesNotRequired() {
    return statesNotRequired;
  }
}
