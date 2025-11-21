package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.DbOrgRoleClaimsService;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/** Base class to hold common beans required for application startup. */
@ActiveProfiles("test")
public class BaseNonSpringBootTestConfiguration {

  // Dependencies of TenantDataAccessFilter
  @MockitoBean private ApiUserRepository _mockApiUserRepository;
  @MockitoBean private ApiUserService _mockApiUserService;
  @MockitoBean private ApiUserContextHolder _mockApiUserContextHolder;
  @MockitoBean private DbOrgRoleClaimsService _mockDbOrgRoleClaimsService;
  @MockitoBean private OrganizationService _mockOrganizationService;
  @MockitoBean private CurrentTenantDataAccessContextHolder _mockContextHolder;
  @MockitoBean private DiseaseService _mockDiseaseService;
  @MockitoBean private FeatureFlagsConfig _featureFlagsConfig;
}
