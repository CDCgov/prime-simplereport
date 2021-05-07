package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.Objects;

public class PatientRegistration {
  private final String registrationLink;
  private final String lookupId;
  private final String firstName;
  private final String middleName;
  private final String lastName;
  private final String suffix;
  private final LocalDate birthDate;
  private final StreetAddress address;
  private final String telephone;
  private final PersonRole role;
  private final String email;
  private final String race;
  private final String ethnicity;
  private final String tribalAffiliation;
  private final String gender;
  private final Boolean residentCongregateSetting;
  private final Boolean employedInHealthcare;
  private final String preferredLanguage;

  @JsonCreator
  public PatientRegistration(
      @JsonProperty("registrationLink") String registrationLink,
      @JsonProperty("lookupId") String lookupId,
      @JsonProperty("firstName") String firstName,
      @JsonProperty("middleName") String middleName,
      @JsonProperty("lastName") String lastName,
      @JsonProperty("suffix") String suffix,
      @JsonProperty("birthDate") LocalDate birthDate,
      @JsonProperty("address") StreetAddress address,
      @JsonProperty("telephone") String telephone,
      @JsonProperty("role") PersonRole role,
      @JsonProperty("email") String email,
      @JsonProperty("race") String race,
      @JsonProperty("ethnicity") String ethnicity,
      @JsonProperty("tribalAffiliation") String tribalAffiliation,
      @JsonProperty("gender") String gender,
      @JsonProperty("residentCongregateSetting") Boolean residentCongregateSetting,
      @JsonProperty("employedInHealthcare") Boolean employedInHealthcare,
      @JsonProperty("preferredLanguage") String preferredLanguage) {
    this.registrationLink = registrationLink;
    this.lookupId = lookupId;
    this.firstName = firstName;
    this.middleName = middleName;
    this.lastName = lastName;
    this.suffix = suffix;
    this.birthDate = birthDate;
    this.address = address;
    this.telephone = telephone;
    this.role = role;
    this.email = email;
    this.race = race;
    this.ethnicity = ethnicity;
    this.tribalAffiliation = tribalAffiliation;
    this.gender = gender;
    this.residentCongregateSetting = residentCongregateSetting;
    this.employedInHealthcare = employedInHealthcare;
    this.preferredLanguage = preferredLanguage;
  }

  public String getRegistrationLink() {
    return registrationLink;
  }

  public String getLookupId() {
    return lookupId;
  }

  public String getFirstName() {
    return firstName;
  }

  public String getMiddleName() {
    return middleName;
  }

  public String getLastName() {
    return lastName;
  }

  public String getSuffix() {
    return suffix;
  }

  public LocalDate getBirthDate() {
    return birthDate;
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

  public String getTribalAffiliation() {
    return tribalAffiliation;
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

  public String getPreferredLanguage() {
    return preferredLanguage;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    PatientRegistration that = (PatientRegistration) o;
    return Objects.equals(registrationLink, that.registrationLink)
        && Objects.equals(lookupId, that.lookupId)
        && Objects.equals(firstName, that.firstName)
        && Objects.equals(middleName, that.middleName)
        && Objects.equals(lastName, that.lastName)
        && Objects.equals(suffix, that.suffix)
        && Objects.equals(birthDate, that.birthDate)
        && Objects.equals(address, that.address)
        && Objects.equals(telephone, that.telephone)
        && role == that.role
        && Objects.equals(email, that.email)
        && Objects.equals(race, that.race)
        && Objects.equals(ethnicity, that.ethnicity)
        && Objects.equals(tribalAffiliation, that.tribalAffiliation)
        && Objects.equals(gender, that.gender)
        && Objects.equals(residentCongregateSetting, that.residentCongregateSetting)
        && Objects.equals(employedInHealthcare, that.employedInHealthcare)
        && Objects.equals(preferredLanguage, that.preferredLanguage);
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        registrationLink,
        lookupId,
        firstName,
        middleName,
        lastName,
        suffix,
        birthDate,
        address,
        telephone,
        role,
        email,
        race,
        ethnicity,
        tribalAffiliation,
        gender,
        residentCongregateSetting,
        employedInHealthcare,
        preferredLanguage);
  }
}
