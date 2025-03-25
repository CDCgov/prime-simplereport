package gov.cdc.usds.simplereport.api.model.universalreporting;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PatientReportInput {
  private String firstName;
  private String middleName;
  private String lastname;
  private String suffix;
  private String email;
  private String phone;
  private String street;
  private String streetTwo;
  private String city;
  private String county;
  private String state;
  private String zipCode;
  private String country;
  private String sex;
  private String dateOfBirth;
  private String race;
  private String ethnicity;
  private String tribalAffiliation;
}
