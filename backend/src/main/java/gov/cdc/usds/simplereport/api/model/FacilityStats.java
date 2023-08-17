package gov.cdc.usds.simplereport.api.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FacilityStats {
  private Integer usersSingleAccessCount;
  private Integer patientsSingleAccessCount;
}
