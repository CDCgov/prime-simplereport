package gov.cdc.usds.simplereport.config;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
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
  private final List<ConfigSupportedDiseaseTestPerformed> supportedDiseaseTestPerformed;
  private final List<String> configuredDeviceTypes;
  private final List<ConfigFacility> facilities;
  private final List<ConfigPatientRegistrationLink> patientRegistrationLinks;

  public List<ConfigFacility> getFacilities() {
    return facilities;
  }

  public List<String> getConfiguredDeviceTypeNames() {
    return configuredDeviceTypes;
  }

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

  public List<ConfigPatientRegistrationLink> getPatientRegistrationLinks() {
    return patientRegistrationLinks;
  }

  @Getter
  public static final class ConfigFacility {
    private final String name;
    private final String cliaNumber;
    private final StreetAddress address;
    private final String telephone;
    private final String email;
    private final String organizationExternalId;

    public ConfigFacility(
        String facilityName,
        String cliaNumber,
        StreetAddress address,
        String telephone,
        String email,
        String organizationExternalId) {
      super();
      this.name = facilityName;
      this.cliaNumber = cliaNumber;
      this.address = address;
      this.telephone = telephone;
      this.email = email;
      this.organizationExternalId = organizationExternalId;
    }

    public Facility makeRealFacility(
        Organization org,
        Provider p,
        DeviceType defaultDeviceType,
        SpecimenType defaultSpecimenType,
        List<DeviceType> configured) {
      return new Facility(
          org,
          name,
          cliaNumber,
          address,
          telephone,
          email,
          p,
          defaultDeviceType,
          defaultSpecimenType,
          configured);
    }
  }

  public static final class ConfigPatientRegistrationLink {
    private final String patientRegistrationLink;
    private final String organizationExternalId;
    private final String facilityName;

    public ConfigPatientRegistrationLink(
        String patientRegistrationLink, String organizationExternalId, String facilityName) {
      super();
      this.patientRegistrationLink = patientRegistrationLink;
      this.organizationExternalId = organizationExternalId;
      this.facilityName = facilityName;
    }

    public PatientSelfRegistrationLink makePatientRegistrationLink(Organization org, String link) {
      return new PatientSelfRegistrationLink(org, link);
    }

    public PatientSelfRegistrationLink makePatientRegistrationLink(Facility fac, String link) {
      return new PatientSelfRegistrationLink(fac, link);
    }

    public String getLink() {
      return patientRegistrationLink;
    }

    public String getOrganizationExternalId() {
      return organizationExternalId;
    }

    public String getFacilityName() {
      return facilityName;
    }
  }

  @Data
  public static final class ConfigDeviceType {
    private final String name;
    private final String manufacturer;
    private final String model;
    private final List<String> specimenType;
  }

  @Data
  public static final class ConfigSupportedDiseaseTestPerformed {
    private final String deviceName;
    private final String testPerformedLoincCode;
    private final String supportedDisease;
    private final String equipmentUid;
    private final String testkitNameId;
  }
}
