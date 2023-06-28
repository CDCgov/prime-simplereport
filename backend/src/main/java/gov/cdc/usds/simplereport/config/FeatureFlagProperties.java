package gov.cdc.usds.simplereport.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@ConfigurationProperties(prefix = "features")
@ConfigurationPropertiesScan
@Getter
@Setter
public class FeatureFlagProperties {
  private boolean multiplexEnabled;
  private boolean hivEnabled;
}
