package gov.cdc.usds.simplereport.api.model.universalreporting;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class PatientReportInput {
  private final String firstName;
  private final String middleName;
  private final String lastName;
  private final String suffix;
  private final String email;
  private final String phone;
  private final String street;
  private final String streetTwo;
  private final String city;
  private final String county;
  private final String state;
  private final String zipCode;
  private final String country;
  private final String sex;
  private final LocalDate dateOfBirth;
  private final String race;
  private final String ethnicity;
  private final String tribalAffiliation;
  private final String patientId;
}
