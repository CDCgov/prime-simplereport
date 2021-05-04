package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.logging.PatientExperienceLoggingInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewFilter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@ConditionalOnWebApplication
public class WebConfiguration implements WebMvcConfigurer {

  public static final String HEALTH_CHECK = "/health";
  public static final String PATIENT_EXPERIENCE = "/pxp/**";
  public static final String ACCOUNT_REQUEST = "/account-request";
  public static final String USER_ACCOUNT_REQUEST = "/user-account";

  @Autowired private PatientExperienceLoggingInterceptor _loggingInterceptor;

  @Override
  public void addViewControllers(ViewControllerRegistry registry) {
    registry.addStatusController(HEALTH_CHECK, HttpStatus.OK);
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(_loggingInterceptor);
  }

  /**
   * We want (at least for now) to be able to lazy-load JPA relationships in the graphql resolver,
   * even after exiting service-layer transactions.
   *
   * <p>Since the graphql servlet does not register a handler with Spring, the Spring
   * HandlerInterceptor does not work: instead, register a servlet filter with the same effect.
   *
   * @return
   */
  @Bean
  public FilterRegistrationBean<OpenEntityManagerInViewFilter> openInViewFilter() {
    return new FilterRegistrationBean<>(new OpenEntityManagerInViewFilter());
  }
}
