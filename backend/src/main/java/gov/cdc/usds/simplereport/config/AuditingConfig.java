package gov.cdc.usds.simplereport.config;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.service.ApiUserService;

@Configuration
@EnableJpaAuditing
public class AuditingConfig {

	private static final Logger LOG = LoggerFactory.getLogger(AuditingConfig.class);

	@Autowired
	private ApiUserService _userService;

	@Bean
	public AuditorAware<ApiUser> getCurrentUserProvider() {
		return () -> {
			LOG.debug("Fetching current user for audit");
			Optional<ApiUser> user = _userService.getCurrentUserForAudit();
			return user;
		};
	}

}
