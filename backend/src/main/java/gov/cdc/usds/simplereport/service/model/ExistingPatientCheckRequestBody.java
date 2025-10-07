package gov.cdc.usds.simplereport.service.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

public class ExistingPatientCheckRequestBody {
  private final String firstName;
  private final String lastName;
  private final LocalDate birthDate;
  private final String postalCode;

  @JsonCreator
  public ExistingPatientCheckRequestBody(
      @JsonProperty("firstName") String firstName,
      @JsonProperty("lastName") String lastName,
      @JsonProperty("birthDate") LocalDate birthDate,
      @JsonProperty("postalCode") String postalCode) {

    this.firstName = firstName;
    this.lastName = lastName;
    this.birthDate = birthDate;
    this.postalCode = postalCode;
  }

  public String getFirstName() {
    return firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public LocalDate getBirthDate() {
    return birthDate;
  }

  public String getPostalCode() {
    return postalCode;
  }
}
