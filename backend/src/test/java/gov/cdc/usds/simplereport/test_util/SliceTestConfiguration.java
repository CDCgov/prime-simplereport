package gov.cdc.usds.simplereport.test_util;

import gov.cdc.usds.simplereport.config.AuditingConfig;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.simplereport.SiteAdminEmailList;
import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OktaServiceImpl;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;

import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

import com.okta.spring.boot.sdk.config.OktaClientProperties;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;

/**
 * Bean creation and wiring required to get slice tests to run without a full
 * application context being created. This is not annotated with a Spring
 * stereotype because we very much do not want it to be picked up automatically!
 */
@Import({ TestDataFactory.class, AuditingConfig.class, OktaServiceImpl.class, ApiUserService.class, OrganizationInitializingService.class })
@EnableConfigurationProperties({
        InitialSetupProperties.class,
        OktaClientProperties.class,
        AuthorizationProperties.class,
        SiteAdminEmailList.class,
        DataHubConfig.class,
        DemoUserConfiguration.class,
})
public class SliceTestConfiguration {

    @Bean
    public IdentitySupplier testIdentityProvider() {
        final Map<String, IdentityAttributes> identityLookup = Stream.of(
                TestUserIdentities.STANDARD_USER_ATTRIBUTES,
                TestUserIdentities.SITE_ADMIN_USER_ATTRIBUTES)
                .collect(Collectors.toMap(IdentityAttributes::getUsername, i -> i));
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null) {
                // needed for running the commandlinerunner that we don't actually need
                return TestUserIdentities.STANDARD_USER_ATTRIBUTES;
            }
            String username = auth.getName();
            LoggerFactory.getLogger(SliceTestConfiguration.class).warn("Found username {} for auth {}", username, auth);
            return identityLookup.get(username);
        };
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @WithMockUser(username = TestUserIdentities.STANDARD_USER, authorities = { "TEST-TENANT:DIS_ORG:USER" })
    @Inherited
    public @interface WithSimpleReportStandardUser {
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @WithMockUser(username = TestUserIdentities.STANDARD_USER, authorities = { "TEST-TENANT:DIS_ORG:USER",
                                                                               "TEST-TENANT:DIS_ORG:ADMIN" })
    @Inherited
    public @interface WithSimpleReportOrgAdminUser {
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @WithMockUser(username = TestUserIdentities.STANDARD_USER, authorities = { "TEST-TENANT:DIS_ORG:USER",
                                                                               "TEST-TENANT:DIS_ORG:ENTRY_ONLY" })
    @Inherited
    public @interface WithSimpleReportEntryOnlyUser {
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target({ ElementType.METHOD, ElementType.TYPE })
    @WithMockUser(username = TestUserIdentities.SITE_ADMIN_USER, authorities = { "TEST-TENANT:DIS_ORG:USER" })
    @Inherited
    public @interface WithSimpleReportSiteAdminUser {
    }

}
