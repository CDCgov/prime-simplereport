package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.logging.PatientExperienceLoggingInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@ConditionalOnWebApplication
public class WebConfiguration implements WebMvcConfigurer {

  public static final String HEALTH_CHECK = "/health";
  public static final String PATIENT_EXPERIENCE = "/pxp/**";
  public static final String TWILIO_CALLBACK = "/pxp/callback";
  public static final String RS_QUEUE_CALLBACK = "/reportstream/callback";
  public static final String ACCOUNT_REQUEST = "/account-request";
  public static final String USER_ACCOUNT_REQUEST = "/user-account";
  public static final String IDENTITY_VERIFICATION = "/identity-verification";

  @Autowired private PatientExperienceLoggingInterceptor _loggingInterceptor;

  @Override
  public void addViewControllers(ViewControllerRegistry registry) {
    registry.addStatusController(HEALTH_CHECK, HttpStatus.OK);
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(_loggingInterceptor);
  }
}
