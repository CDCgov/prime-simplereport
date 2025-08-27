package gov.cdc.usds.simplereport.api.model.universalreporting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NonNull;

@Getter
@AllArgsConstructor
@Builder
public class FacilityReportInput {
  @NonNull private final String name;
  @NonNull private final String clia;
  private final String street;
  private final String streetTwo;
  private final String city;
  private final String county;
  private final String state;
  private final String zipCode;
  @NonNull private final String phone;
  private final String email;
}
