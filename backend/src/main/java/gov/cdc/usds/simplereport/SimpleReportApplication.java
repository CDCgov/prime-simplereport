package gov.cdc.usds.simplereport;

import javax.servlet.Filter;

import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.simplereport.AdminEmailList;
import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewFilter;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling
// Adding any configuration here should probably be added to SliceTestConfiguration &/or SliceTestConfigurationAdmin
@EnableConfigurationProperties({InitialSetupProperties.class, AdminEmailList.class, DataHubConfig.class})
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
