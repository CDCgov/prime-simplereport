package gov.cdc.usds.simplereport.properties;

import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report.experian")
@Getter
public class ExperianProperties {
    private final String tokenEndpoint;
    private final String domain;
    private final String username;
    private final String password;
    private final String clientId;
    private final String clientSecret;

    @ConstructorBinding
    public ExperianProperties(
        String tokenEndpoint,
        String domain,
        String username, 
        String password,
        String clientId,
        String clientSecret
    ) {
        this.tokenEndpoint = tokenEndpoint;
        this.domain = domain;
        this.username = username;
        this.password = password;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }
}
