package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.DbOrgRoleClaimsService;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

/** Base class to hold common beans required for application startup. */
@ActiveProfiles("test")
public class BaseNonSpringBootTestConfiguration {

  // Dependencies of TenantDataAccessFilter
  @MockBean private ApiUserRepository _mockApiUserRepository;
  @MockBean private ApiUserService _mockApiUserService;
  @MockBean private ApiUserContextHolder _mockApiUserContextHolder;
  @MockBean private DbOrgRoleClaimsService _mockDbOrgRoleClaimsService;
  @MockBean private OrganizationService _mockOrganizationService;
  @MockBean private CurrentTenantDataAccessContextHolder _mockContextHolder;
  @MockBean private DiseaseService _mockDiseaseService;
  @MockBean private FeatureFlagsConfig _featureFlagsConfig;
}
