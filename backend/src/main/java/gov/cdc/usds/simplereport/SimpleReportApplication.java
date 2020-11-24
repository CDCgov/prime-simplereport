package gov.cdc.usds.simplereport;

import javax.servlet.Filter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewFilter;

@SpringBootApplication
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
