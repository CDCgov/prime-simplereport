package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProviderInput {
  private PersonName fullName;
  private String firstName;
  private String middleName;
  private String lastName;
  private String suffix;
  private String npi;
  private String street;
  private String streetTwo;
  private String city;
  private String state;
  private String zipCode;
  private String phone;
}
