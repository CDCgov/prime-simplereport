package gov.cdc.usds.simplereport.config;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.service.ApiUserService;

@Configuration
public class AuditingConfig {

	public static final String ID_PROVIDER = "currentUserProvider";

	private static final Logger LOG = LoggerFactory.getLogger(AuditingConfig.class);

	@Autowired
	private ApiUserService _userService;

	@Bean(ID_PROVIDER)
	public AuditorAware<ApiUser> getCurrentUserProvider() {
		return () -> {
			LOG.debug("Fetching current user for audit");
			return Optional.ofNullable(_userService.getCurrentUser());
		};
	}

}
