package gov.cdc.usds.simplereport;

import javax.servlet.Filter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewFilter;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.simplereport.AdminEmailList;
import java.util.TimeZone;
import javax.annotation.PostConstruct;

@SpringBootApplication
@EnableConfigurationProperties({
        InitialSetupProperties.class,
        AdminEmailList.class,
        AuthorizationProperties.class,
})
public class SimpleReportApplication {

   @PostConstruct
    public void init(){
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }

    public static void main(String[] args) {
        SpringApplication.run(SimpleReportApplication.class, args);
    }

    /**
   * Register the {@link OpenEntityManagerInViewFilter} so that the
   * GraphQL-Servlet can handle lazy loads during execution.
   *
   * @return
   */
  @Bean
  public Filter OpenFilter() {
    return new OpenEntityManagerInViewFilter();
  }
}
