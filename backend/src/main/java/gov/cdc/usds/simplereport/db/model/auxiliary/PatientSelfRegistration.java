package gov.cdc.usds.simplereport.db.model.auxiliary;

import static gov.cdc.usds.simplereport.api.Translators.parsePersonRole;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import gov.cdc.usds.simplereport.api.model.PersonUpdate;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

public class PatientSelfRegistration extends PersonUpdate {
  private final String registrationLink;
  private final String lookupId;
  private final String firstName;
  private final String middleName;
  private final String lastName;
  private final String suffix;
  private final LocalDate birthDate;

  @JsonCreator
  public PatientSelfRegistration(
      @JsonProperty("registrationLink") String registrationLink,
      @JsonProperty("lookupId") String lookupId,
      @JsonProperty("firstName") String firstName,
      @JsonProperty("middleName") String middleName,
      @JsonProperty("lastName") String lastName,
      @JsonProperty("suffix") String suffix,
      @JsonProperty("birthDate") LocalDate birthDate,
      @JsonProperty("address") StreetAddress address,
      @JsonProperty("country") String country,
      @JsonProperty("telephone") String telephone,
      @JsonProperty("phoneNumbers") List<PhoneNumberInput> phoneNumbers,
      @JsonProperty("role") String role,
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
    super(
        address,
        country,
        telephone,
        phoneNumbers,
        parsePersonRole(role, false),
        email,
        emails,
        race,
        ethnicity,
        tribalAffiliation,
        gender,
        residentCongregateSetting,
        employedInHealthcare,
        preferredLanguage,
        testResultDelivery);
    this.registrationLink = registrationLink;
    this.lookupId = lookupId;
    this.firstName = firstName;
    this.middleName = middleName;
    this.lastName = lastName;
    this.suffix = suffix;
    this.birthDate = birthDate;
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

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    PatientSelfRegistration that = (PatientSelfRegistration) o;
    return Objects.equals(registrationLink, that.registrationLink)
        && Objects.equals(lookupId, that.lookupId)
        && Objects.equals(firstName, that.firstName)
        && Objects.equals(middleName, that.middleName)
        && Objects.equals(lastName, that.lastName)
        && Objects.equals(suffix, that.suffix)
        && Objects.equals(birthDate, that.birthDate)
        && Objects.equals(getAddress(), that.getAddress())
        && Objects.equals(getCountry(), that.getCountry())
        && Objects.equals(getTelephone(), that.getTelephone())
        && Objects.equals(getPhoneNumbers(), that.getPhoneNumbers())
        && getRole() == that.getRole()
        && Objects.equals(getEmail(), that.getEmail())
        && Objects.equals(getRace(), that.getRace())
        && Objects.equals(getEthnicity(), that.getEthnicity())
        && Objects.equals(getTribalAffiliation(), that.getTribalAffiliation())
        && Objects.equals(getGender(), that.getGender())
        && Objects.equals(getResidentCongregateSetting(), that.getResidentCongregateSetting())
        && Objects.equals(getEmployedInHealthcare(), that.getEmployedInHealthcare())
        && Objects.equals(getPreferredLanguage(), that.getPreferredLanguage());
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
        getAddress(),
        getCountry(),
        getTelephone(),
        getPhoneNumbers(),
        getRole(),
        getEmail(),
        getRace(),
        getEthnicity(),
        getTribalAffiliation(),
        getGender(),
        getResidentCongregateSetting(),
        getEmployedInHealthcare(),
        getPreferredLanguage());
  }
}
