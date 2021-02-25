package gov.cdc.usds.simplereport.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;
import org.springframework.context.annotation.Profile;

@Profile("!"+BeanProfiles.NO_OKTA_MGMT)
@ConfigurationProperties(prefix = "simple-report.okta-application")
@ConstructorBinding
public class OktaApplicationProperties {

    private String name;

    public OktaApplicationProperties(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
