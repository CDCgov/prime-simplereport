package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.service.ApiUserService;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
@Slf4j
public class AuditingConfig {
  @Autowired private ApiUserService _userService;

  @Bean
  public AuditorAware<ApiUser> getCurrentApiUserProvider() {
    return () -> {
      log.debug("Fetching current user for audit");
      Optional<ApiUser> user = Optional.of(_userService.getCurrentApiUserInContainedTransaction());
      return user;
    };
  }
}
