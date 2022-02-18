package gov.cdc.usds.simplereport.properties;

import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "twilio")
@Getter
public class TwilioProperties {

  private final String messagingSid;

  @ConstructorBinding
  public TwilioProperties(String messagingSid) {
    this.messagingSid = messagingSid;
  }
}
