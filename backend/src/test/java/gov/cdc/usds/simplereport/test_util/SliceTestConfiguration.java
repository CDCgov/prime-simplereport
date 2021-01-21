package gov.cdc.usds.simplereport.test_util;

import gov.cdc.usds.simplereport.config.AuditingConfig;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.simplereport.AdminEmailList;
import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;

import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.Map;

import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;

/**
 * Bean creation and wiring required to get slice tests to run without a full
 * application context being created. This is not annotated with a Spring
 * stereotype because we very much do not want it to be picked up automatically!
 */
@Import({ TestDataFactory.class, AuditingConfig.class, ApiUserService.class, OrganizationInitializingService.class })
@EnableConfigurationProperties({InitialSetupProperties.class, AdminEmailList.class, DataHubConfig.class})
public class SliceTestConfiguration {

    public static final String SITE_ADMIN_USER = "ruby@example.com";
    public static final String STANDARD_USER = "bob@example.com";

    private static final Map<String, IdentityAttributes> TEST_USERS = Map.of(
            STANDARD_USER, new IdentityAttributes(STANDARD_USER, "Bobbity", "Bob", "Bobberoo", null),
            SITE_ADMIN_USER, new IdentityAttributes(SITE_ADMIN_USER, "Ruby", "Raven", "Reynolds", null));

    @Bean
    public IdentitySupplier testIdentityProvider() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) {
                // needed for running the commandlinerunner that we don't actually need
                return TEST_USERS.get(STANDARD_USER);
            }
            String username = auth.getName();
            LoggerFactory.getLogger(SliceTestConfiguration.class).warn("Found username {} for auth {}", username, auth);
            return TEST_USERS.get(username);
        };
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @WithMockUser(username = STANDARD_USER, authorities = { "TEST-TENANT:DIS_ORG:USER" })
    @Inherited
    public @interface WithSimpleReportStandardUser {
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @WithMockUser(username = SITE_ADMIN_USER, authorities = { "TEST-TENANT:DIS_ORG:USER" })
    @Inherited
    public @interface WithSimpleReportSiteAdminUser {
    }

}
