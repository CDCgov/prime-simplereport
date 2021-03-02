package gov.cdc.usds.simplereport.config;

import com.okta.spring.boot.oauth.Okta;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.info.InfoEndpoint;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Live (with Okta integration) request-level security configuration. Not to be confused with {@link
 * AuthorizationConfiguration}, which is not environment-specific and handles method-level or
 * object-level security.
 */
@Configuration
@Profile("!" + BeanProfiles.NO_SECURITY) // Activate this profile to disable security
@ConditionalOnWebApplication
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  public static final String SAVED_REQUEST_HEADER = "SPRING_SECURITY_SAVED_REQUEST";
  private static final Logger LOG = LoggerFactory.getLogger(SecurityConfiguration.class);

  @Autowired private CurrentPatientContextHolder _contextHolder;

  public interface OktaAttributes {
    public static String EMAIL = "email";
    public static String FIRST_NAME = "given_name";
    public static String LAST_NAME = "family_name";
  }

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests()
        .antMatchers("/")
        .permitAll()
        .antMatchers(HttpMethod.OPTIONS, "/**")
        .permitAll()
        .antMatchers(HttpMethod.GET, WebConfiguration.HEALTH_CHECK)
        .permitAll()
        .requestMatchers(EndpointRequest.to(HealthEndpoint.class))
        .permitAll()
        .requestMatchers(EndpointRequest.to(InfoEndpoint.class))
        .permitAll()

        // Patient experience authorization is handled in PatientExperienceController
        // If this configuration changes, please update the documentation on both sides
        .antMatchers(HttpMethod.PUT, WebConfiguration.PATIENT_EXPERIENCE)
        .permitAll()

        // Anything else goes through Okta
        .anyRequest()
        .authenticated()

        // We don't have sessions, so can't have CSRF. Spring's automatic CSRF support
        // breaks the REST controller, so, disable it:
        .and()
        .csrf()
        .disable();

    Okta.configureResourceServer401ResponseBody(http);
  }

  @Bean
  public IdentitySupplier getRealIdentity() {
    return () -> {
      Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
      if (principal instanceof OidcUser) {
        OidcUser me = (OidcUser) principal;
        LOG.debug("OIDC user found with attributes {}", me.getAttributes());
        String firstName = me.getAttribute(OktaAttributes.FIRST_NAME);
        String lastName = me.getAttribute(OktaAttributes.LAST_NAME);
        String email = me.getAttribute(OktaAttributes.EMAIL);
        if (lastName == null) {
          lastName = email;
        }
        LOG.debug("Hello OIDC user {} {} ({})", firstName, lastName, email);
        return new IdentityAttributes(email, firstName, null, lastName, null);
      } else if (principal instanceof Jwt) {
        Jwt token = (Jwt) principal;
        LOG.debug("JWT user found with claims {}", token.getClaims());
        String email = token.getSubject();
        String firstName = token.getClaim(OktaAttributes.FIRST_NAME);
        String lastName = token.getClaim(OktaAttributes.LAST_NAME);
        if (lastName == null) {
          lastName = email;
        }
        LOG.debug("Hello JWT user {} {} ({})", firstName, lastName, email);
        return new IdentityAttributes(email, firstName, null, lastName, null);
      } else if (!SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
        Person patient = _contextHolder.getPatient();
        if (patient != null) {
          LOG.debug(
              "Creating IdentityAttributes for Person {} from PatientLink {}",
              patient.getInternalId(),
              _contextHolder.getPatientLink().getInternalId());
          return new IdentityAttributes(
              getPatientIdEmail(patient),
              patient.getFirstName(),
              patient.getMiddleName(),
              patient.getLastName(),
              patient.getSuffix());
        }
      }
      throw new RuntimeException(
          "Unexpected authentication principal of type " + principal.getClass());
    };
  }

  public static String getPatientIdEmail(Person patient) {
    return patient.getInternalId() + "-noreply@simplereport.gov";
  }
}
