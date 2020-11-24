package gov.cdc.usds.simplereport.config;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.RequestCache;
import org.springframework.security.web.savedrequest.SimpleSavedRequest;

import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;

/**
 * Created by nickrobison on 11/13/20
 */
@Configuration
@Profile("!" + DevSecurityConfiguration.PROFILE) // Activate this profile to disable security
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    public static final String SAVED_REQUEST_HEADER = "SPRING_SECURITY_SAVED_REQUEST";
    private static final Logger LOG = LoggerFactory.getLogger(SecurityConfiguration.class);

    public interface OktaAttributes {
        public static final String EMAIL = "email";
        public static final String FIRST_NAME = "given_name";
        public static final String LAST_NAME = "family_name";
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http
                .authorizeRequests()
                .antMatchers("/").permitAll()
                .anyRequest()
                .authenticated()
                .and()
                .csrf()
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .and()
                .oauth2ResourceServer().jwt();
    }

    @Bean
    public RequestCache refererRequestCache() {
        return new HttpSessionRequestCache() {
            @Override
            public void saveRequest(HttpServletRequest request, HttpServletResponse response) {
                final String referrer = request.getHeader("referer");
                if (referrer != null) {
                    request.getSession().setAttribute(SAVED_REQUEST_HEADER, new SimpleSavedRequest(referrer));
                }
            }
        };
    }


	@Bean
	public IdentitySupplier getRealIdentity() {
		return () -> {
			OidcUser me = (OidcUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
			String firstName = me.getAttribute(OktaAttributes.FIRST_NAME);
			String lastName = me.getAttribute(OktaAttributes.LAST_NAME);
			String email = me.getAttribute(OktaAttributes.EMAIL);
			LOG.debug("Hello {} {} ({})", firstName, lastName, email);
			return new IdentityAttributes(email, firstName, null, lastName, null);
		};
	}
}
