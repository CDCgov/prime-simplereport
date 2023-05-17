package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.FacilityBuilder;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report-initialization")
@ConstructorBinding
@RequiredArgsConstructor
@Getter
public class InitialSetupProperties {
  private final List<Organization> organizations;
  private final Provider provider;
  private final List<SpecimenType> specimenTypes;
  private final List<ConfigDeviceType> deviceTypes;
  private final List<String> configuredDeviceTypes;
  private final List<ConfigFacility> facilities;
  private final List<ConfigPatientRegistrationLink> patientRegistrationLinks;

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

  public Provider getProvider() {
    PersonName n = provider.getNameInfo();
    return new Provider(
        n.getFirstName(),
        n.getMiddleName(),
        n.getLastName(),
        n.getSuffix(),
        provider.getProviderId(),
        provider.getAddress(),
        provider.getTelephone());
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
        Provider provider,
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
              .orderingProvider(provider)
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
