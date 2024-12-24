package gov.cdc.usds.simplereport.api.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AddProviderInput {
  private String firstName;
  private String middleName;
  private String lastName;
  private String suffix;
  private String npi;
  private String street;
  private String streetTwo;
  private String city;
  private String county;
  private String state;
  private String zipCode;
  private String phone;
}
