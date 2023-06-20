package gov.cdc.usds.simplereport.config;

import static gov.cdc.usds.simplereport.config.SecurityConfiguration.applicationSecurityFilterChain;

import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Live (with Okta integration) request-level security configuration, but skips audit logging for
 * creating sample devices (we can get rid of this and just use SecurityConfiguration when we are no
 * longer auditing).
 */
@Configuration
@Profile("!" + BeanProfiles.NO_SECURITY + " & " + BeanProfiles.CREATE_SAMPLE_DEVICES)
@ConditionalOnWebApplication
@Slf4j
public class OktaLocalSecurityConfiguration {

  public interface OktaAttributes {
    String EMAIL = "email";
    String FIRST_NAME = "given_name";
    String LAST_NAME = "family_name";
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return applicationSecurityFilterChain(http);
  }

  @Bean
  public IdentitySupplier getRealIdentity() {
    return () -> {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();

      if (auth == null) {
        return new IdentityAttributes("devicesetup@simplereport.gov", "App", null, "Setup", null);
      }

      Object principal = auth.getPrincipal();
      if (principal instanceof OidcUser) {
        OidcUser me = (OidcUser) principal;
        log.debug("OIDC user found with attributes {}", me.getAttributes());
        String firstName = me.getAttribute(OktaAttributes.FIRST_NAME);
        String lastName = me.getAttribute(OktaAttributes.LAST_NAME);
        String email = me.getAttribute(OktaAttributes.EMAIL);
        if (lastName == null) {
          lastName = email;
        }
        log.debug("Hello OIDC user {} {} ({})", firstName, lastName, email);
        return new IdentityAttributes(email, firstName, null, lastName, null);
      } else if (principal instanceof Jwt) {
        Jwt token = (Jwt) principal;
        log.debug("JWT user found with claims {}", token.getClaims());
        String email = token.getSubject();
        String firstName = token.getClaim(OktaAttributes.FIRST_NAME);
        String lastName = token.getClaim(OktaAttributes.LAST_NAME);
        if (lastName == null) {
          lastName = email;
        }
        log.debug("Hello JWT user {} {} ({})", firstName, lastName, email);
        return new IdentityAttributes(email, firstName, null, lastName, null);
      } else if (principal instanceof String && "anonymousUser".equals(principal)) {
        return null;
      }
      throw new RuntimeException(
          "Unexpected authentication principal of type " + principal.getClass());
    };
  }
}
