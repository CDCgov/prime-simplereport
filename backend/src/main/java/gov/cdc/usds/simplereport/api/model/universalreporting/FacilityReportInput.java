package gov.cdc.usds.simplereport.api.model.universalreporting;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FacilityReportInput {
  private String name;
  private String clia;
  private String street;
  private String streetTwo;
  private String city;
  private String county;
  private String state;
  private String zipCode;
  private String phone;
  private String email;
}
