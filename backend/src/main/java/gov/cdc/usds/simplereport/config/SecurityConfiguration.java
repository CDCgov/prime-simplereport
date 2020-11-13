package gov.cdc.usds.simplereport.config;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.RequestCache;
import org.springframework.security.web.savedrequest.SimpleSavedRequest;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by nickrobison on 11/13/20
 */
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    public static final String SAVED_REQUEST_HEADER = "SPRING_SECURITY_SAVED_REQUEST";

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .oauth2Login()
                .and().csrf()
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .and()
                .authorizeRequests()
                .antMatchers("/**/*.{js,html,css}").permitAll()
                .anyRequest().authenticated();
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
}
