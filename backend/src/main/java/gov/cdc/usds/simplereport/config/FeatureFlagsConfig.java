package gov.cdc.usds.simplereport.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "features")
@Component
@Getter
@Setter
public class FeatureFlagsConfig {
  private boolean hivEnabled;
  private boolean singleEntryRsvEnabled;
  private boolean agnosticEnabled;
  private boolean agnosticBulkUploadEnabled;
  private boolean testCardRefactorEnabled;
}
