package gov.cdc.usds.simplereport.test_util;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

import gov.cdc.usds.simplereport.config.AuditingConfig;
import gov.cdc.usds.simplereport.config.DevSecurityConfiguration;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;

/**
 * Bean creation and wiring required to get slice tests to run without a full application
 * context being created. This is not annotated with a Spring stereotype because we very much
 * do not want it to be picked up automatically!
 */
@Import({TestDataFactory.class, AuditingConfig.class, ApiUserService.class})
public class SliceTestConfiguration {

	@Bean
	public IdentitySupplier dummyIdentityProvider() {
		return new DevSecurityConfiguration().getDummyIdentity();
	}
}
