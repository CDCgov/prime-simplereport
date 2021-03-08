package gov.cdc.usds.simplereport.test_util;

import gov.cdc.usds.simplereport.config.authorization.DemoUserIdentitySupplier;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration.DemoUser;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * This class is intended to manage identities and authorizations for controller/graphql API tests.
 * At the moment, it is only used by PatientExperienceControllerTest, to override the default
 * IdentitySupplier (which is unrealistic and masked a serious bug). In the future it may either
 * expand to cover BaseApiTest and its descendants, or go away entirely.
 */
public class TestIdentityConfiguration {

  @Bean
  @Primary
  public IdentitySupplier testIdentityProvider() {
    return new DemoUserIdentitySupplier(
        List.of(
            new DemoUser(null, TestUserIdentities.STANDARD_USER_ATTRIBUTES),
            new DemoUser(null, TestUserIdentities.SITE_ADMIN_USER_ATTRIBUTES)));
  }

  /**
   * Set the security context to hold a particular user, then run some code, then reset the user.
   *
   * @param username a username that is known to the current IdentitySupplier
   * @param nested a lambda to run
   */
  public static void withUser(String username, Runnable nested) {
    SecurityContext context = SecurityContextHolder.getContext();
    Authentication original = context.getAuthentication();
    try {
      context.setAuthentication(new TestingAuthenticationToken(username, null, List.of()));
      nested.run();
    } finally {
      context.setAuthentication(original);
    }
  }

  /**
   * Set the security context to hold the "default" user ({@link TestUserIdentities#STANDARD_USER}),
   * then run some code, then reset the user.
   *
   * @param nested a lambda to run
   */
  public static void withStandardUser(Runnable nested) {
    TestIdentityConfiguration.withUser(TestUserIdentities.STANDARD_USER, nested);
  }
}
