package gov.cdc.usds.simplereport.api.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.util.Objects;

public class PersonUpdate {
  private final StreetAddress address;
  private final String telephone;
  private final PersonRole role;
  private final String email;
  private final String race;
  private final String ethnicity;
  private final String gender;
  private final Boolean residentCongregateSetting;
  private final Boolean employedInHealthcare;

  @JsonCreator
  public PersonUpdate(
      @JsonProperty("address") StreetAddress address,
      @JsonProperty("telephone") String telephone,
      @JsonProperty("role") PersonRole role,
      @JsonProperty("email") String email,
      @JsonProperty("race") String race,
      @JsonProperty("ethnicity") String ethnicity,
      @JsonProperty("gender") String gender,
      @JsonProperty("residentCongregateSetting") Boolean residentCongregateSetting,
      @JsonProperty("employedInHealthcare") Boolean employedInHealthcare) {
    this.address = address;
    this.telephone = telephone;
    this.role = role;
    this.email = email;
    this.race = race;
    this.ethnicity = ethnicity;
    this.gender = gender;
    this.residentCongregateSetting = residentCongregateSetting;
    this.employedInHealthcare = employedInHealthcare;
  }

  public StreetAddress getAddress() {
    return address;
  }

  public String getTelephone() {
    return telephone;
  }

  public PersonRole getRole() {
    return role;
  }

  public String getEmail() {
    return email;
  }

  public String getRace() {
    return race;
  }

  public String getEthnicity() {
    return ethnicity;
  }

  public String getGender() {
    return gender;
  }

  public Boolean getResidentCongregateSetting() {
    return residentCongregateSetting;
  }

  public Boolean getEmployedInHealthcare() {
    return employedInHealthcare;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    PersonUpdate that = (PersonUpdate) o;
    return Objects.equals(address, that.address)
        && Objects.equals(telephone, that.telephone)
        && role == that.role
        && Objects.equals(email, that.email)
        && Objects.equals(race, that.race)
        && Objects.equals(ethnicity, that.ethnicity)
        && Objects.equals(gender, that.gender)
        && Objects.equals(residentCongregateSetting, that.residentCongregateSetting)
        && Objects.equals(employedInHealthcare, that.employedInHealthcare);
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        address,
        telephone,
        role,
        email,
        race,
        ethnicity,
        gender,
        residentCongregateSetting,
        employedInHealthcare);
  }
}
