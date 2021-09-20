package gov.cdc.usds.simplereport.api.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class TopLevelDashboardMetrics {
  private long positiveTestCount;
  private long totalTestCount;
}
