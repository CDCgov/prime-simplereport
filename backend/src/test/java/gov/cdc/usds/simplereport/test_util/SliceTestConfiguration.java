package gov.cdc.usds.simplereport.test_util;

import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.config.AuditingConfig;
import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.authorization.AuthorizationServiceConfig;
import gov.cdc.usds.simplereport.config.authorization.DemoUserIdentitySupplier;
import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration.DemoUser;
import gov.cdc.usds.simplereport.config.simplereport.SiteAdminEmailList;
import gov.cdc.usds.simplereport.db.repository.BaseRepositoryTest;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.List;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;

/**
 * Bean creation and wiring required to get slice tests to run without a full application context
 * being created. This is not annotated with a Spring stereotype because we very much do not want it
 * to be picked up automatically!
 *
 * <h2>Purpose of this configuration</h2>
 *
 * The aim of this class is to provide a single importable configuration that allows all slice tests
 * (e.g. {@link DataJpaTest} or our slightly wonky service-layer tests) to run, without wiring up
 * the full application context.
 *
 * <h2>How to use it</h2>
 *
 * If you are creating a new test that does not test the full stack (that is, it is not making mock
 * HTTP calls) and does not extend {@link BaseServiceTest} or {@link BaseRepositoryTest} (which,
 * honestly, it probably should), then you can set up your test context by annotating your test
 * class with {@code @Import(SliceTestConfiguration.class)}.
 *
 * <h2>How it works</h2>
 *
 * This class does three things:
 *
 * <ol>
 *   <li>It sets up (most of) the same bound configuration properties that the main context has, so
 *       we can still read properties from our application configuration normally. This is done via
 *       the {@link EnableConfigurationProperties} annotation, which we also remind people to keep
 *       up-to-date via a polite comment on our {@code main} method in {@code
 *       SimpleReportApplication}.
 *   <li>It wires in (via the {@link Import} annotation) specific configurations and services that
 *       are needed for running service tests (probably more of them than are needed for repository
 *       tests, but oh well), which are not automatically wired up when we are launching a partial
 *       context.
 *   <li>It creates a small number of beans with specific information for service-level testing, to
 *       allow service tests to specify users using reasonably standard Spring testing patterns.
 * </ol>
 *
 * This class also contains a set of shortcut annotations that can be applied to tests or test
 * classes to get a reasonable user of a particular type into the SecurityContext for testing
 * purposes. They should be used for any test that requires an authenticated user and does not
 * require changing users mid-test.
 */
@Import({
  TestDataFactory.class,
  AuditingConfig.class,
  DemoOktaRepository.class,
  AuthorizationServiceConfig.class,
  OrganizationExtractor.class,
  OrganizationService.class,
  ApiUserService.class,
  OrganizationInitializingService.class,
  CurrentPatientContextHolder.class
})
@EnableConfigurationProperties({
  InitialSetupProperties.class,
  AuthorizationProperties.class,
  SiteAdminEmailList.class,
  DataHubConfig.class,
  DemoUserConfiguration.class,
})
public class SliceTestConfiguration {

  @Bean
  public IdentitySupplier testIdentityProvider() {
    return new DemoUserIdentitySupplier(
        List.of(
            new DemoUser(null, TestUserIdentities.STANDARD_USER_ATTRIBUTES),
            new DemoUser(null, TestUserIdentities.SITE_ADMIN_USER_ATTRIBUTES)));
  }

  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.METHOD, ElementType.TYPE})
  @WithMockUser(
      username = TestUserIdentities.STANDARD_USER,
      authorities = {"TEST-TENANT:DIS_ORG:USER"})
  @Inherited
  public @interface WithSimpleReportStandardUser {}

  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.METHOD, ElementType.TYPE})
  @WithMockUser(
      username = TestUserIdentities.STANDARD_USER,
      authorities = {"TEST-TENANT:DIS_ORG:USER", "TEST-TENANT:DIS_ORG:ADMIN"})
  @Inherited
  public @interface WithSimpleReportOrgAdminUser {}

  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.METHOD, ElementType.TYPE})
  @WithMockUser(
      username = TestUserIdentities.STANDARD_USER,
      authorities = {"TEST-TENANT:DIS_ORG:USER", "TEST-TENANT:DIS_ORG:ENTRY_ONLY"})
  @Inherited
  public @interface WithSimpleReportEntryOnlyUser {}

  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.METHOD, ElementType.TYPE})
  @WithMockUser(
      username = TestUserIdentities.SITE_ADMIN_USER,
      authorities = {"TEST-TENANT:DIS_ORG:USER"})
  @Inherited
  public @interface WithSimpleReportSiteAdminUser {}
}
