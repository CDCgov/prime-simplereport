package gov.cdc.usds.simplereport.api.model;

import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateProviderInput {
  private UUID providerId;
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
