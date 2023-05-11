package gov.cdc.usds.simplereport.api.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AddressInput {
  private String street;
  private String streetTwo;
  private String city;
  private String state;
  private String zipCode;
}
