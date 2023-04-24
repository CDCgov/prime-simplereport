package gov.cdc.usds.simplereport.properties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@AllArgsConstructor
@ConstructorBinding
@ConfigurationProperties(prefix = "simple-report.experian")
@Getter
public class ExperianProperties {

  private final String tokenEndpoint;
  private final String initialRequestEndpoint;
  private final String domain;
  private final String clientId;
  private final String clientSecret;

  private final String crosscoreSubscriberSubcode;
  private final String crosscoreUsername;
  private final String crosscorePassword;

  private final String preciseidTenantId;
  private final String preciseidClientReferenceId;
  private final String preciseidUsername;
  private final String preciseidPassword;
}
