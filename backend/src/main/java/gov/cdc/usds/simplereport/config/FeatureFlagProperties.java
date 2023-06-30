package gov.cdc.usds.simplereport.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "features")
@Getter
@Setter
public class FeatureFlagProperties {
  private boolean multiplexEnabled;
  private boolean hivEnabled;
}
