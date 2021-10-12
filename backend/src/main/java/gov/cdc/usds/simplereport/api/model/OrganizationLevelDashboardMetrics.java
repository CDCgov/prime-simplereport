package gov.cdc.usds.simplereport.api.model;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class OrganizationLevelDashboardMetrics {
  private long organizationPositiveTestCount;
  private long organizationNegativeTestCount;
  private long organizationTotalTestCount;
  private List<AggregateFacilityMetrics> facilityMetrics;
}
