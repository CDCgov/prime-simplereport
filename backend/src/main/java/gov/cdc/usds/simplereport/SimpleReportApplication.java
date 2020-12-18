package gov.cdc.usds.simplereport;

import javax.servlet.Filter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewFilter;

import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.SimpleReportProperties;

@SpringBootApplication
@EnableConfigurationProperties({InitialSetupProperties.class, SimpleReportProperties.class})
public class SimpleReportApplication {

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
