package gov.cdc.usds.simplereport.api.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class AggregateFacilityMetrics {
  private String facilityName;
  private long totalTestCount;
  private long peopleTestedCount;
  private long positiveTestCount;
  private long negativeTestCount;
}
