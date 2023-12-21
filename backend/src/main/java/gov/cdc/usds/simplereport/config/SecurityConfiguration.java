package gov.cdc.usds.simplereport.config;

import com.okta.spring.boot.oauth.Okta;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.info.InfoEndpoint;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * Live (with Okta integration) request-level security configuration. Not to be confused with {@link
 * AuthorizationConfiguration}, which is not environment-specific and handles method-level or
 * object-level security.
 */
@Configuration
@Profile(
    "!"
        + BeanProfiles.NO_SECURITY // Activate the "no-security" profile to disable security
        + " & !"
        + BeanProfiles.CREATE_SAMPLE_DEVICES) // If we're creating sample devices,
// OktaLocalSecurityConfiguration is used instead
@ConditionalOnWebApplication
@Slf4j
public class SecurityConfiguration {

  public static final String SAVED_REQUEST_HEADER = "SPRING_SECURITY_SAVED_REQUEST";

  public interface OktaAttributes {
    String EMAIL = "email";
    String FIRST_NAME = "given_name";
    String LAST_NAME = "family_name";
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(
            authorizeRequest ->
                authorizeRequest
                    .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers("/echo/**", "/authTest/**")
                    .permitAll()
                    .requestMatchers(EndpointRequest.to(HealthEndpoint.class))
                    .permitAll()
                    .requestMatchers(EndpointRequest.to(InfoEndpoint.class))
                    .permitAll()
                    // Patient experience authorization is handled in PatientExperienceController
                    // If this configuration changes, please update the documentation on both sides
                    .requestMatchers(HttpMethod.POST, WebConfiguration.PATIENT_EXPERIENCE)
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, WebConfiguration.PATIENT_EXPERIENCE)
                    .permitAll()
                    // Twilio callback authorization is handled in the controller
                    .requestMatchers(HttpMethod.POST, WebConfiguration.TWILIO_CALLBACK)
                    .permitAll()
                    // Feature Flags that apply at app level
                    .requestMatchers(HttpMethod.GET, WebConfiguration.FEATURE_FLAGS)
                    .permitAll()
                    // ReportStreamResponse callback authorization is handled in the controller
                    .requestMatchers(HttpMethod.POST, WebConfiguration.RS_QUEUE_CALLBACK)
                    .permitAll()
                    // Account requests are unauthorized
                    .requestMatchers(
                        HttpMethod.POST,
                        WebConfiguration.ACCOUNT_REQUEST + "/**",
                        WebConfiguration.IDENTITY_VERIFICATION + "/**")
                    .permitAll()
                    // User account creation request authorization is handled in
                    // UserAccountCreationController
                    .requestMatchers(HttpMethod.POST, WebConfiguration.USER_ACCOUNT_REQUEST + "/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, WebConfiguration.USER_ACCOUNT_REQUEST + "/**")
                    .permitAll()
                    // Anything else goes through Okta
                    .anyRequest()
                    .authenticated())
        .oauth2ResourceServer(
            oauth2ResourceServer -> oauth2ResourceServer.jwt(Customizer.withDefaults()))
        // Most of the app doesn't use sessions, so can't have CSRF. Spring's automatic CSRF
        // breaks the REST controller, so we disable it for most paths.
        // USER_ACCOUNT_REQUEST does use sessions, so CSRF is enabled there.
        .csrf(
            csrf ->
                csrf.requireCsrfProtectionMatcher(
                    new AntPathRequestMatcher(WebConfiguration.USER_ACCOUNT_REQUEST)))
        .cors(Customizer.withDefaults());
    Okta.configureResourceServer401ResponseBody(http);
    return http.build();
  }

  @Bean
  public IdentitySupplier getRealIdentity() {
    return () -> {
      Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
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
