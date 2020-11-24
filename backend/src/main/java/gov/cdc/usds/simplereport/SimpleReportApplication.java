package gov.cdc.usds.simplereport;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import javax.servlet.Filter;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewFilter;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableJpaAuditing // this should live on AuditingConfig, but then we have to rewire tests:
                   // https://github.com/spring-projects/spring-boot/issues/13337
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
