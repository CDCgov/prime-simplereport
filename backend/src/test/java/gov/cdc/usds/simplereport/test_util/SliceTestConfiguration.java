package gov.cdc.usds.simplereport.test_util;

import gov.cdc.usds.simplereport.api.ApiUserContextHolder;
import gov.cdc.usds.simplereport.api.CurrentAccountRequestContextHolder;
import gov.cdc.usds.simplereport.api.CurrentOrganizationRolesContextHolder;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.WebhookContextHolder;
import gov.cdc.usds.simplereport.api.heathcheck.BackendAndDatabaseHealthIndicator;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.config.AuditingConfig;
import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.SendGridDisabledConfiguration;
import gov.cdc.usds.simplereport.config.authorization.DemoAuthenticationConfiguration;
import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration.DemoUser;
import gov.cdc.usds.simplereport.db.repository.BaseRepositoryTest;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.AuthorizationService;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.service.DiseaseCacheService;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.LoggedInAuthorizationService;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.PatientSelfRegistrationLinkService;
import gov.cdc.usds.simplereport.service.ResultService;
import gov.cdc.usds.simplereport.service.TenantDataAccessService;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import gov.cdc.usds.simplereport.validators.OrderingProviderRequiredValidator;
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
 * <p>The aim of this class is to provide a single importable configuration that allows all slice
 * tests (e.g. {@link DataJpaTest} or our slightly wonky service-layer tests) to run, without wiring
 * up the full application context.
 *
 * <h2>How to use it</h2>
 *
 * <p>If you are creating a new test that does not test the full stack (that is, it is not making
 * mock HTTP calls) and does not extend {@link BaseServiceTest} or {@link BaseRepositoryTest}
 * (which, honestly, it probably should), then you can set up your test context by annotating your
 * test class with {@code @Import(SliceTestConfiguration.class)}.
 *
 * <h2>How it works</h2>
 *
 * <p>This class does three things:
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
 * <p>This class also contains a set of shortcut annotations that can be applied to tests or test
 * classes to get a reasonable user of a particular type into the SecurityContext for testing
 * purposes. They should be used for any test that requires an authenticated user and does not
 * require changing users mid-test.
 */
@Import({
  TestDataFactory.class,
  AuditingConfig.class,
  DemoOktaRepository.class,
  OrganizationExtractor.class,
  OrganizationService.class,
  ApiUserService.class,
  DiseaseService.class,
  DiseaseCacheService.class,
  ResultService.class,
  OrganizationInitializingService.class,
  CurrentPatientContextHolder.class,
  CurrentAccountRequestContextHolder.class,
  ApiUserContextHolder.class,
  CurrentOrganizationRolesContextHolder.class,
  OrderingProviderRequiredValidator.class,
  CurrentTenantDataAccessContextHolder.class,
  WebhookContextHolder.class,
  TenantDataAccessService.class,
  PatientSelfRegistrationLinkService.class,
  BackendAndDatabaseHealthIndicator.class,
  EmailService.class,
  SendGridDisabledConfiguration.class,
})
@EnableConfigurationProperties({InitialSetupProperties.class, AuthorizationProperties.class})
public class SliceTestConfiguration {

  private static final String DEFAULT_ROLE_PREFIX =
      TestUserIdentities.TEST_ROLE_PREFIX + TestUserIdentities.DEFAULT_ORGANIZATION + ":";
  private static final String OTHER_ORG_ROLE_PREFIX =
      TestUserIdentities.TEST_ROLE_PREFIX + TestUserIdentities.OTHER_ORGANIZATION + ":";

  public static final class Role {
    public static final String SITE_ADMIN = "SR-UNITTEST-ADMINS";
    public static final String DEFAULT_ORG_USER =
        SliceTestConfiguration.DEFAULT_ROLE_PREFIX + "USER";
    public static final String DEFAULT_ORG_ADMIN =
        SliceTestConfiguration.DEFAULT_ROLE_PREFIX + "ADMIN";
    public static final String DEFAULT_ORG_ENTRY =
        SliceTestConfiguration.DEFAULT_ROLE_PREFIX + "ENTRY_ONLY";
    public static final String DEFAULT_ORG_NO_ACCESS =
        SliceTestConfiguration.DEFAULT_ROLE_PREFIX + "NO_ACCESS";
    public static final String DEFAULT_ORG_ALL_FACILITIES =
        SliceTestConfiguration.DEFAULT_ROLE_PREFIX + "ALL_FACILITIES";

    public static final String OTHER_ORG_NO_ACCESS =
        SliceTestConfiguration.OTHER_ORG_ROLE_PREFIX + "NO_ACCESS";
    public static final String OTHER_ORG_USER =
        SliceTestConfiguration.OTHER_ORG_ROLE_PREFIX + "USER";
  }

  @Bean
  public IdentitySupplier testIdentityProvider() {
    List<DemoUser> sliceTestUsers =
        List.of(
            // these objects will be used only to resolve the user's identity, not their
            // permissions: leaving the role claims blank to make sure nobody tries to update
            // test user permissions here and wonders why it doesn't work
            new DemoUser(null, TestUserIdentities.STANDARD_USER_ATTRIBUTES),
            new DemoUser(null, TestUserIdentities.SITE_ADMIN_USER_ATTRIBUTES));
    return DemoAuthenticationConfiguration.getCurrentDemoUserSupplier(
        new DemoUserConfiguration(sliceTestUsers));
  }

  @Bean
  public AuthorizationService realAuthorizationService(OrganizationExtractor extractor) {
    return new LoggedInAuthorizationService(
        extractor, new AuthorizationProperties(null, "UNITTEST"));
  }

  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.METHOD, ElementType.TYPE})
  @WithMockUser(
      username = TestUserIdentities.STANDARD_USER,
      authorities = {Role.DEFAULT_ORG_NO_ACCESS, Role.DEFAULT_ORG_USER})
  @Inherited
  public @interface WithSimpleReportStandardUser {}

  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.METHOD, ElementType.TYPE})
  @WithMockUser(
      username = TestUserIdentities.STANDARD_USER,
      authorities = {
        Role.DEFAULT_ORG_NO_ACCESS,
        Role.DEFAULT_ORG_USER,
        Role.DEFAULT_ORG_ALL_FACILITIES
      })
  @Inherited
  public @interface WithSimpleReportStandardAllFacilitiesUser {}

  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.METHOD, ElementType.TYPE})
  @WithMockUser(
      username = TestUserIdentities.STANDARD_USER,
      authorities = {Role.DEFAULT_ORG_NO_ACCESS, Role.DEFAULT_ORG_ADMIN})
  @Inherited
  public @interface WithSimpleReportOrgAdminUser {}

  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.METHOD, ElementType.TYPE})
  @WithMockUser(
      username = TestUserIdentities.STANDARD_USER,
      authorities = {Role.DEFAULT_ORG_NO_ACCESS, Role.DEFAULT_ORG_ENTRY})
  @Inherited
  public @interface WithSimpleReportEntryOnlyUser {}

  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.METHOD, ElementType.TYPE})
  @WithMockUser(
      username = TestUserIdentities.STANDARD_USER,
      authorities = {
        Role.DEFAULT_ORG_NO_ACCESS,
        Role.DEFAULT_ORG_ENTRY,
        Role.DEFAULT_ORG_ALL_FACILITIES
      })
  @Inherited
  public @interface WithSimpleReportEntryOnlyAllFacilitiesUser {}

  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.METHOD, ElementType.TYPE})
  @WithMockUser(
      username = TestUserIdentities.SITE_ADMIN_USER,
      authorities = {Role.SITE_ADMIN})
  @Inherited
  public @interface WithSimpleReportSiteAdminUser {}

  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.METHOD, ElementType.TYPE})
  @WithMockUser(
      username = TestUserIdentities.OTHER_ORG_USER,
      authorities = {Role.OTHER_ORG_NO_ACCESS, Role.OTHER_ORG_USER})
  @Inherited
  public @interface WithSimpleReportOtherOrgUser {}
}
