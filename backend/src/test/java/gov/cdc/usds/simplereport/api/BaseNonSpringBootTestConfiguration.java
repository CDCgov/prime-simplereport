package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.DiseaseService;
import org.springframework.boot.test.mock.mockito.MockBean;

/** Base class to hold common beans required for application startup. */
public class BaseNonSpringBootTestConfiguration {

  // Dependencies of TenantDataAccessFilter
  @MockBean private ApiUserService _mockApiUserService;
  @MockBean private DiseaseService _mockDiseaseService;
}
