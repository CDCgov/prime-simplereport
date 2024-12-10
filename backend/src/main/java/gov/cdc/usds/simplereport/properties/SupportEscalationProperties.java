package gov.cdc.usds.simplereport.properties;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@RequiredArgsConstructor
@ConfigurationProperties(prefix = "simple-report.support-escalation")
public class SupportEscalationProperties {
  private final String enabled;
}
