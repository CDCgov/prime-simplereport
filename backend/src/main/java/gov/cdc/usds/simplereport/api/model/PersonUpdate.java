package gov.cdc.usds.simplereport.api.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneNumberInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import java.util.List;
import java.util.Objects;

public class PersonUpdate {
  private final StreetAddress address;
  private final String country;
  private final String telephone;
  private final List<PhoneNumberInput> phoneNumbers;
  private final PersonRole role;
  private final String email;
  private final List<String> emails;
  private final String race;
  private final String ethnicity;
  private final String tribalAffiliation;
  private final String gender;
  private final Boolean residentCongregateSetting;
  private final Boolean employedInHealthcare;
  private final String preferredLanguage;
  private final TestResultDeliveryPreference testResultDelivery;

  @JsonCreator
  public PersonUpdate(
      @JsonProperty("address") StreetAddress address,
      @JsonProperty("country") String country,
      @JsonProperty("telephone") String telephone,
      @JsonProperty("phoneNumbers") List<PhoneNumberInput> phoneNumbers,
      @JsonProperty("role") PersonRole role,
      @JsonProperty("email") String email,
      @JsonProperty("emails") List<String> emails,
      @JsonProperty("race") String race,
      @JsonProperty("ethnicity") String ethnicity,
      @JsonProperty("tribalAffiliation") String tribalAffiliation,
      @JsonProperty("gender") String gender,
      @JsonProperty("residentCongregateSetting") Boolean residentCongregateSetting,
      @JsonProperty("employedInHealthcare") Boolean employedInHealthcare,
      @JsonProperty("preferredLanguage") String preferredLanguage,
      @JsonProperty("testResultDelivery") TestResultDeliveryPreference testResultDelivery) {
    this.address = address;
    this.country = country;
    this.telephone = telephone;
    this.phoneNumbers = phoneNumbers;
    this.role = role;
    this.email = email;
    this.emails = emails;
    this.race = race;
    this.ethnicity = ethnicity;
    this.tribalAffiliation = tribalAffiliation;
    this.gender = gender;
    this.residentCongregateSetting = residentCongregateSetting;
    this.employedInHealthcare = employedInHealthcare;
    this.preferredLanguage = preferredLanguage;
    this.testResultDelivery = testResultDelivery;
  }

  public StreetAddress getAddress() {
    return address;
  }

  public String getCountry() {
    return country;
  }

  public String getEmail() {
    return email;
  }

  public List<String> getEmails() {
    return emails;
  }

  public Boolean getEmployedInHealthcare() {
    return employedInHealthcare;
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

  public String getRace() {
    return race;
  }

  public Boolean getResidentCongregateSetting() {
    return residentCongregateSetting;
  }

  public PersonRole getRole() {
    return role;
  }

  public String getTelephone() {
    return telephone;
  }

  public List<PhoneNumberInput> getPhoneNumbers() {
    return phoneNumbers;
  }

  public String getPreferredLanguage() {
    return preferredLanguage;
  }

  public TestResultDeliveryPreference getTestResultDelivery() {
    return testResultDelivery;
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
        && Objects.equals(country, that.country)
        && Objects.equals(telephone, that.telephone)
        && Objects.equals(phoneNumbers, that.phoneNumbers)
        && role == that.role
        && Objects.equals(email, that.email)
        && Objects.equals(emails, that.emails)
        && Objects.equals(race, that.race)
        && Objects.equals(ethnicity, that.ethnicity)
        && Objects.equals(tribalAffiliation, that.tribalAffiliation)
        && Objects.equals(gender, that.gender)
        && Objects.equals(residentCongregateSetting, that.residentCongregateSetting)
        && Objects.equals(employedInHealthcare, that.employedInHealthcare);
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        address,
        country,
        telephone,
        phoneNumbers,
        role,
        email,
        emails,
        race,
        ethnicity,
        tribalAffiliation,
        gender,
        residentCongregateSetting,
        employedInHealthcare);
  }
}
