package gov.cdc.usds.simplereport.properties;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report.ordering-providers")
public class OrderingProviderProperties {
  private final List<String> statesNotRequired;

  @ConstructorBinding
  public OrderingProviderProperties(List<String> statesNotRequired) {
    this.statesNotRequired = statesNotRequired;
  }

  public List<String> getStatesNotRequired() {
    return statesNotRequired;
  }
}
