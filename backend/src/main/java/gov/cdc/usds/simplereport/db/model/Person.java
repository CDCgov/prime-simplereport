package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import gov.cdc.usds.simplereport.api.MappingConstants;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.RaceArrayConverter;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import org.hibernate.annotations.Type;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.Coding;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.Identifier.IdentifierUse;
import org.hl7.fhir.r4.model.Patient;
import org.hl7.fhir.r4.model.StringType;

/**
 * The person record (generally, a patient getting a test).
 *
 * <p>ATTENTION PLEASE: if you ever add a field to this object, you must decide if it should be
 * saved forever as part of a {@link TestEvent}, and annotate it with {@link JsonIgnore} if not.
 *
 * <p>EVEN MORE ATTENTION PLEASE: if you ever change the <b>type</b> of any non-ignored field of
 * this object, you will likely break many things, so do not do that.
 */
@Entity
public class Person extends OrganizationScopedEternalEntity implements PersonEntity, LocatedEntity {

  // NOTE: facility==NULL means this person appears in ALL facilities for a given Organization.
  // this is common for imported patients.
  @ManyToOne(optional = true, fetch = FetchType.LAZY)
  @JoinColumn(name = "facility_id")
  @JsonIgnore // do not serialize to TestEvents
  private Facility facility;

  @Column private String lookupId;

  @Column(nullable = false)
  @Embedded
  @JsonUnwrapped
  private PersonName nameInfo;

  @Column private LocalDate birthDate;
  @Embedded private StreetAddress address;
  @Column private String country;
  @Column private String gender;

  @Column
  @JsonDeserialize(converter = RaceArrayConverter.class)
  private String race;

  /**
   * Tribal Affiliation maps to this data set:
   * https://github.com/CDCgov/prime-data-hub/blob/master/prime-router/metadata/valuesets/tribal.valuesets
   */
  @Type(type = "jsonb")
  @Column
  private List<String> tribalAffiliation;

  @Column private String ethnicity;

  /**
   * Note that for the purposes of all upserts, the <em>first</em> phone number in a
   * List<PhoneNumber> is considered to be the primary
   */
  @OneToOne(fetch = FetchType.LAZY)
  private PhoneNumber primaryPhone;

  @OneToMany(mappedBy = "person", fetch = FetchType.LAZY)
  private List<PhoneNumber> phoneNumbers;

  @Column private String email;

  @Type(type = "list-array")
  @Column
  private List<String> emails = new ArrayList<>();

  @Column(nullable = true)
  private Boolean employedInHealthcare;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private PersonRole role;

  @Column(nullable = true)
  private Boolean residentCongregateSetting;

  @Column(nullable = true)
  private String preferredLanguage;

  @Type(type = "pg_enum")
  @Enumerated(EnumType.STRING)
  private TestResultDeliveryPreference testResultDeliveryPreference;

  protected Person() {
    /* for hibernate */
  }

  public Person(
      String firstName, String middleName, String lastName, String suffix, Organization org) {
    super(org);
    this.nameInfo = new PersonName(firstName, middleName, lastName, suffix);
    this.role = PersonRole.STAFF;
  }

  public Person(
      Organization organization,
      String lookupId,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      LocalDate birthDate,
      StreetAddress address,
      String country,
      PersonRole role,
      List<String> emails,
      String race,
      String ethnicity,
      List<String> tribalAffiliation,
      String gender,
      Boolean residentCongregateSetting,
      Boolean employedInHealthcare,
      String preferredLanguage,
      TestResultDeliveryPreference testResultDeliveryPreference) {
    super(organization);
    this.lookupId = lookupId;
    this.nameInfo = new PersonName(firstName, middleName, lastName, suffix);
    this.birthDate = birthDate;
    this.address = address;
    this.country = country;
    this.role = role;
    this.emails = emails;
    this.race = race;
    this.ethnicity = ethnicity;
    this.tribalAffiliation = tribalAffiliation;
    this.gender = gender;
    this.residentCongregateSetting = residentCongregateSetting;
    this.employedInHealthcare = employedInHealthcare;
    this.preferredLanguage = preferredLanguage;
    this.testResultDeliveryPreference = testResultDeliveryPreference;
  }

  public Person(
      Organization organization,
      Facility facility,
      String lookupId,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      LocalDate birthDate,
      StreetAddress address,
      String country,
      PersonRole role,
      List<String> emails,
      String race,
      String ethnicity,
      List<String> tribalAffiliation,
      String gender,
      Boolean residentCongregateSetting,
      Boolean employedInHealthcare,
      String preferredLanguage,
      TestResultDeliveryPreference testResultDeliveryPreference) {
    this(
        organization,
        lookupId,
        firstName,
        middleName,
        lastName,
        suffix,
        birthDate,
        address,
        country,
        role,
        emails,
        race,
        ethnicity,
        tribalAffiliation,
        gender,
        residentCongregateSetting,
        employedInHealthcare,
        preferredLanguage,
        testResultDeliveryPreference);
    this.facility = facility;
  }

  public Person(PersonName names, Organization org, Facility facility) {
    super(org);
    this.facility = facility;
    this.nameInfo = names;
    this.role = PersonRole.STAFF;
  }

  public Person(PersonName names, Organization org, Facility facility, PersonRole role) {
    super(org);
    this.facility = facility;
    this.nameInfo = names;
    this.role = role;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Person person = (Person) o;
    return nameInfo.equals(person.nameInfo)
        && birthDate.equals(person.birthDate)
        && Objects.equals(facility, person.facility)
        && Objects.equals(getOrganization(), person.getOrganization())
        && (isDeleted() == person.isDeleted());
  }

  @Override
  public int hashCode() {
    return Objects.hash(nameInfo, birthDate, facility, getOrganization(), isDeleted());
  }

  public void updatePatient(
      String lookupId,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      LocalDate birthDate,
      StreetAddress address,
      String country,
      PersonRole role,
      List<String> emails,
      String race,
      String ethnicity,
      List<String> tribalAffiliation,
      String gender,
      Boolean residentCongregateSetting,
      Boolean employedInHealthcare,
      String preferredLanguage,
      TestResultDeliveryPreference testResultDeliveryPreference) {
    this.lookupId = lookupId;
    this.nameInfo.setFirstName(firstName);
    this.nameInfo.setMiddleName(middleName);
    this.nameInfo.setLastName(lastName);
    this.nameInfo.setSuffix(suffix);
    this.birthDate = birthDate;
    this.address = address;
    this.country = country;
    this.role = role;
    this.emails = emails;
    this.race = race;
    this.ethnicity = ethnicity;
    this.tribalAffiliation = tribalAffiliation;
    this.gender = gender;
    this.residentCongregateSetting = residentCongregateSetting;
    this.employedInHealthcare = employedInHealthcare;
    this.preferredLanguage = preferredLanguage;
    if (testResultDeliveryPreference != null) {
      this.testResultDeliveryPreference = testResultDeliveryPreference;
    }
  }

  public Facility getFacility() {
    return facility;
  }

  public void setFacility(Facility f) {
    facility = f;
  }

  public PhoneNumber getPrimaryPhone() {
    return this.primaryPhone;
  }

  public void setPrimaryPhone(PhoneNumber phoneNumber) {
    this.primaryPhone = phoneNumber;
  }

  public void setPrimaryEmail(String email) {
    this.email = email;
  }

  public String getLookupId() {
    return lookupId;
  }

  public PersonName getNameInfo() {
    return nameInfo;
  }

  public String getFirstName() {
    return nameInfo.getFirstName();
  }

  public String getMiddleName() {
    return nameInfo.getMiddleName();
  }

  public String getLastName() {
    return nameInfo.getLastName();
  }

  public String getSuffix() {
    return nameInfo.getSuffix();
  }

  public LocalDate getBirthDate() {
    return birthDate;
  }

  public StreetAddress getAddress() {
    return address;
  }

  public String getCountry() {
    return country;
  }

  public String getTelephone() {
    PhoneNumber pn = this.getPrimaryPhone();
    if (pn == null) {
      return "";
    }
    return pn.getNumber();
  }

  public List<PhoneNumber> getPhoneNumbers() {
    return phoneNumbers;
  }

  public String getEmail() {
    if (emails == null || emails.isEmpty()) {
      return null;
    }

    return this.emails.get(0);
  }

  public List<String> getEmails() {
    if (emails == null) {
      return Collections.emptyList();
    }

    return emails.stream().filter(Objects::nonNull).collect(Collectors.toList());
  }

  public String getRace() {
    return race;
  }

  public String getEthnicity() {
    return ethnicity;
  }

  public List<String> getTribalAffiliation() {
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

  @JsonIgnore
  public String getStreet() {
    return address == null ? "" : address.getStreetOne();
  }

  @JsonIgnore
  public String getStreetTwo() {
    return address == null ? "" : address.getStreetTwo();
  }

  @JsonIgnore
  public String getCity() {
    if (address == null) {
      return "";
    }
    return address.getCity();
  }

  @JsonIgnore
  public String getState() {
    if (address == null) {
      return "";
    }
    return address.getState();
  }

  @JsonIgnore
  public String getZipCode() {
    if (address == null) {
      return "";
    }
    return address.getPostalCode();
  }

  @JsonIgnore
  public String getCounty() {
    if (address == null) {
      return "";
    }
    return address.getCounty();
  }

  public PersonRole getRole() {
    return role;
  }

  public String getPreferredLanguage() {
    return preferredLanguage;
  }

  /**
   * Note that this getter's name is used in the GraphQL schema, but the underlying field name
   * differs for specificity
   */
  public TestResultDeliveryPreference getTestResultDelivery() {
    return testResultDeliveryPreference;
  }

  public void setTestResultDelivery(TestResultDeliveryPreference testResultDeliveryPreference) {
    this.testResultDeliveryPreference = testResultDeliveryPreference;
  }

  // these field names strings are used by Specification builders
  public static final class SpecField {
    public static final String PERSON_NAME = "nameInfo";
    public static final String ADDRESS = "address";
    public static final String IS_DELETED = "isDeleted";
    public static final String FACILITY = "facility";
    public static final String ORGANIZATION = "organization";
    public static final String INTERNAL_ID = "internalId";
    public static final String FIRST_NAME = "firstName";
    public static final String MIDDLE_NAME = "middleName";
    public static final String LAST_NAME = "lastName";
    public static final String BIRTH_DATE = "birthDate";
    public static final String POSTAL_CODE = "postalCode";

    private SpecField() {} // sonarcloud codesmell
  }

  @JsonIgnore
  public Patient toFhir() {
    var patient = new Patient();
    addIdentifier(patient);
    addFhirName(patient);
    addFhirTelecom(patient);
    setFhirGender(patient);
    setFhirBirthDate(patient);
    setFhirAddress(patient);
    addRaceExtension(patient);
    addEthnicityExtension(patient);
    addTribalAffiliationExtension(patient);
    return patient;
  }

  @JsonIgnore
  private void addTribalAffiliationExtension(Patient patient) {
    if (tribalAffiliation != null
        && !tribalAffiliation.isEmpty()
        && PersonUtils.tribalMap().containsKey(tribalAffiliation.get(0))) {
      var ext = patient.addExtension();
      ext.setUrl("http://hl7.org/fhir/us/core/StructureDefinition/us-core-tribal-affiliation");
      var tribeExtension = ext.addExtension();
      tribeExtension.setUrl("tribalAffiliation");
      var tribeCodeableConcept = new CodeableConcept();
      var tribeCoding = tribeCodeableConcept.addCoding();
      tribeCoding.setSystem("http://terminology.hl7.org/CodeSystem/v3-TribalEntityUS");
      tribeCoding.setCode(tribalAffiliation.get(0));
      tribeCoding.setDisplay(PersonUtils.tribalMap().get(tribalAffiliation.get(0)));
      tribeCodeableConcept.setText(PersonUtils.tribalMap().get(tribalAffiliation.get(0)));
      tribeExtension.setValue(tribeCodeableConcept);
    }
  }

  @JsonIgnore
  private void addEthnicityExtension(Patient patient) {
    if (ethnicity != null) {
      var ext = patient.addExtension();
      ext.setUrl("http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity");
      var ombExtension = ext.addExtension();
      ombExtension.setUrl("ombCategory");
      var ombCoding = new Coding();
      if (PersonUtils.ETHNICITY_MAP.containsKey(ethnicity)) {
        if ("refused".equalsIgnoreCase(ethnicity)) {
          ombCoding.setSystem(MappingConstants.NULL_CODE_SYSTEM);
        } else {
          ombCoding.setSystem("urn:oid:2.16.840.1.113883.6.238");
        }
        ombCoding.setCode(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(0));
        ombCoding.setDisplay(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(1));

        var text = ext.addExtension();
        text.setUrl("text");
        text.setValue(new StringType(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(1)));
      } else {
        ombCoding.setSystem(MappingConstants.NULL_CODE_SYSTEM);
        ombCoding.setCode(MappingConstants.UNK_CODE);
        ombCoding.setDisplay(MappingConstants.UNKNOWN_STRING);

        var text = ext.addExtension();
        text.setUrl("text");
        text.setValue(new StringType(MappingConstants.UNKNOWN_STRING));
      }
      ombExtension.setValue(ombCoding);
    }
  }

  @JsonIgnore
  private void addRaceExtension(Patient patient) {
    var ext = patient.addExtension();
    ext.setUrl("http://ibm.com/fhir/cdm/StructureDefinition/local-race-cd");
    var codeable = new CodeableConcept();
    var coding = codeable.addCoding();
    if (race != null && PersonUtils.raceMap.containsKey(race)) {
      if (MappingConstants.UNKNOWN_STRING.equalsIgnoreCase(race)
          || "refused".equalsIgnoreCase(race)) {
        coding.setSystem(MappingConstants.NULL_CODE_SYSTEM);
      } else {
        coding.setSystem("http://terminology.hl7.org/CodeSystem/v3-Race");
      }
      coding.setCode(PersonUtils.raceMap.get(race));
      codeable.setText(race);
    } else {
      coding.setSystem(MappingConstants.NULL_CODE_SYSTEM);
      coding.setCode(MappingConstants.UNK_CODE);
      codeable.setText(MappingConstants.UNKNOWN_STRING);
    }
    ext.setValue(codeable);
  }

  @JsonIgnore
  private void addIdentifier(Patient patient) {
    if (getInternalId() != null) {
      patient.addIdentifier().setValue(getInternalId().toString()).setUse(IdentifierUse.USUAL);
    }
  }

  @JsonIgnore
  private void addFhirName(Patient patient) {
    if (nameInfo != null) {
      patient.addName(nameInfo.toFhir());
    }
  }

  @JsonIgnore
  private void addFhirTelecom(Patient patient) {
    if (phoneNumbers != null) {
      phoneNumbers.forEach(number -> patient.addTelecom(number.toFhir()));
    }
    if (emails != null) {
      emails.forEach(
          e -> {
            var emailTelecom = new ContactPoint().setSystem(ContactPointSystem.EMAIL).setValue(e);
            patient.addTelecom(emailTelecom);
          });
    }
  }

  @JsonIgnore
  private void setFhirBirthDate(Patient patient) {
    if (birthDate != null) {
      patient.setBirthDate(Date.from(birthDate.atStartOfDay(ZoneId.systemDefault()).toInstant()));
    }
  }

  @JsonIgnore
  private void setFhirAddress(Patient patient) {
    if (address != null) {
      patient.setAddress(List.of(address.toFhir()));
    }
  }

  @JsonIgnore
  private void setFhirGender(Patient patient) {
    if ("male".equalsIgnoreCase(gender)) {
      patient.setGender(AdministrativeGender.MALE);
    } else if ("female".equalsIgnoreCase(gender)) {
      patient.setGender(AdministrativeGender.FEMALE);
    } else {
      patient.setGender(AdministrativeGender.UNKNOWN);
    }
  }
}
