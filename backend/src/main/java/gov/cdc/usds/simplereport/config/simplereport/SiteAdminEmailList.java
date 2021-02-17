package gov.cdc.usds.simplereport.config.simplereport;

import java.util.ArrayList;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix="simple-report.site-admin-emails")
public class SiteAdminEmailList extends ArrayList<String> {
    private static final long serialVersionUID = 1L;
}