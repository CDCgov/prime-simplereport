package gov.cdc.usds.simplereport.config;

import static gov.cdc.usds.simplereport.api.Translators.parseState;
import static gov.cdc.usds.simplereport.api.Translators.parseString;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.FacilityBuilder;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "simple-report-initialization")
@RequiredArgsConstructor
@Getter
public class InitialSetupProperties {
  private final List<Organization> organizations;
  private final List<ConfigProvider> providers;
  private final List<SpecimenType> specimenTypes;
  private final List<ConfigDeviceType> deviceTypes;
  private final List<String> configuredDeviceTypes;
  private final List<ConfigFacility> facilities;
  private final List<ConfigPatientRegistrationLink> patientRegistrationLinks;
  private final List<ConfigPatient> patients;

  public List<Organization> getOrganizations() {
    return organizations.stream()
        .map(
            o ->
                new Organization(
                    o.getOrganizationName(),
                    o.getOrganizationType(),
                    o.getExternalId(),
                    o.getIdentityVerified()))
        .collect(Collectors.toList());
  }

  public List<SpecimenType> getSpecimenTypes() {
    return specimenTypes.stream()
        .map(
            s ->
                new SpecimenType(
                    s.getName(),
                    s.getTypeCode(),
                    s.getCollectionLocationName(),
                    s.getCollectionLocationCode()))
        .collect(Collectors.toList());
  }

  @Value
  public static class ConfigFacility {
    String name;
    String cliaNumber;
    StreetAddress address;
    String telephone;
    String email;
    String organizationExternalId;

    public Facility makeRealFacility(
        Organization org,
        DeviceType defaultDeviceType,
        SpecimenType defaultSpecimenType,
        List<DeviceType> configured) {

      return new Facility(
          FacilityBuilder.builder()
              .org(org)
              .facilityName(getName())
              .cliaNumber(getCliaNumber())
              .facilityAddress(getAddress())
              .phone(getTelephone())
              .email(getEmail())
              .defaultDeviceType(defaultDeviceType)
              .defaultSpecimenType(defaultSpecimenType)
              .configuredDevices(configured)
              .build());
    }
  }

  @Value
  public static class ConfigPatientRegistrationLink {
    String link;
    String organizationExternalId;
    String facilityName;

    public PatientSelfRegistrationLink makePatientRegistrationLink(Organization org, String link) {
      return new PatientSelfRegistrationLink(org, link);
    }

    public PatientSelfRegistrationLink makePatientRegistrationLink(Facility fac, String link) {
      return new PatientSelfRegistrationLink(fac, link);
    }
  }

  @Value
  public static class ConfigPatient {
    String firstName;
    String lastName;
    String birthDate;
    String organizationExternalId;

    public Person makePatient(
        Organization org, String firstName, String lastName, String birthDate) {
      DateTimeFormatter dateTimeFormat = DateTimeFormatter.ofPattern("M/d/yyyy");
      LocalDate localDateBirthDate = LocalDate.parse(birthDate, dateTimeFormat);
      StreetAddress patientAddress =
          new StreetAddress(
              parseString("123 Main Street"),
              parseString(""),
              parseString("Minneapolis"),
              parseState("MN"),
              parseString("55407"),
              parseString("Hennepin"));
      return Person.builder()
          .firstName(firstName)
          .lastName(lastName)
          .birthDate(localDateBirthDate)
          .facility(null)
          .organization(org)
          .address(patientAddress)
          .country("USA")
          .race("other")
          .ethnicity("not_hispanic")
          .gender("male")
          .genderIdentity("male")
          .employedInHealthcare(true)
          .residentCongregateSetting(true)
          .role(PersonRole.STAFF)
          .testResultDeliveryPreference(TestResultDeliveryPreference.NONE)
          .build();
    }
  }

  @Value
  public static class ConfigProvider {
    String firstName;
    String lastName;
    String providerId;
    StreetAddress address;
    String telephone;
    String facilityName;

    public Provider makeProvider() {
      return new Provider(
              firstName,
              "",
              lastName,
              "",
              providerId,
              address,
              telephone);
    }
  }

  @Value
  public static class ConfigDeviceType {
    String name;
    String manufacturer;
    String model;
    Integer testLength;
    List<String> specimenTypes;
    List<ConfigSupportedDiseaseTestPerformed> testPerformedLoincs;
  }

  @Value
  public static class ConfigSupportedDiseaseTestPerformed {
    String testPerformedLoincCode;
    String supportedDisease;
    String equipmentUid;
    String testkitNameId;
    String testOrderedLoincCode;
  }
}
