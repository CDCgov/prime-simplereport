package gov.cdc.usds.simplereport.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;


@ConfigurationProperties(prefix = "simple-report")
@ConstructorBinding
public class SimpleReportProperties {

    private List<String> adminEmails;

    public SimpleReportProperties(List<String> adminEmails) {
        this.adminEmails = adminEmails;
    }

    public List<String> getAdminEmails() {
        return adminEmails;
    }
}
