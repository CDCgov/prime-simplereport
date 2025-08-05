package gov.cdc.usds.simplereport.api.model.universalreporting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class FacilityReportInput {
  private final String name;
  private final String clia;
  private final String street;
  private final String streetTwo;
  private final String city;
  private final String county;
  private final String state;
  private final String zipCode;
  private final String phone;
  private final String email;
}
