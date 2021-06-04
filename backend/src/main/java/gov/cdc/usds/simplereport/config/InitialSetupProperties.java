package gov.cdc.usds.simplereport.config;

import static gov.cdc.usds.simplereport.utils.DeviceTestLengthConverter.determineTestLength;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
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
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report-initialization")
@ConstructorBinding
public class InitialSetupProperties {

  private List<Organization> organizations;
  private Provider provider;
  private List<SpecimenType> specimenTypes;
  private List<? extends DeviceType> deviceTypes;
  private List<String> configuredDeviceTypes;
  private List<ConfigFacility> facilities;
  private List<ConfigPatientRegistrationLink> patientRegistrationLinks;

  public InitialSetupProperties(
      List<Organization> organizations,
      List<ConfigFacility> facilities,
      Provider provider,
      List<SpecimenType> specimenTypes,
      List<DeviceType> deviceTypes,
      List<String> configuredDeviceTypes,
      List<ConfigPatientRegistrationLink> patientRegistrationLinks) {
    this.organizations = organizations;
    this.provider = provider;
    this.specimenTypes = specimenTypes;
    this.deviceTypes = deviceTypes;
    this.configuredDeviceTypes = configuredDeviceTypes;
    this.facilities = facilities;
    this.patientRegistrationLinks = patientRegistrationLinks;
  }

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
                    o.getOrganizationName(), o.getExternalId(), o.getIdentityVerified()))
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

  public List<DeviceType> getDeviceTypes() {
    return deviceTypes.stream()
        .map(
            d ->
                new DeviceType(
                    d.getName(),
                    d.getManufacturer(),
                    d.getModel(),
                    d.getLoincCode(),
                    d.getSwabType(),
                    determineTestLength(d.getName())))
        .collect(Collectors.toList());
  }

  public List<ConfigPatientRegistrationLink> getPatientRegistrationLinks() {
    return patientRegistrationLinks;
  }

  public static final class ConfigFacility {
    private String name;
    private String cliaNumber;
    private StreetAddress address;
    private String telephone;
    private String email;
    private String organizationExternalId;

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
        DeviceSpecimenType defaultDeviceSpec,
        List<DeviceSpecimenType> configured) {
      return new Facility(
          org, name, cliaNumber, address, telephone, email, p, defaultDeviceSpec, configured);
    }

    public String getName() {
      return name;
    }

    public String getCliaNumber() {
      return cliaNumber;
    }

    public StreetAddress getAddress() {
      return address;
    }

    public String getTelephone() {
      return telephone;
    }

    public String getEmail() {
      return email;
    }

    public String getOrganizationExternalId() {
      return organizationExternalId;
    }
  }

  public static final class ConfigPatientRegistrationLink {
    private String patientRegistrationLink;
    private String organizationExternalId;

    public ConfigPatientRegistrationLink(
        String patientRegistrationLink, String organizationExternalId) {
      super();
      this.patientRegistrationLink = patientRegistrationLink;
      this.organizationExternalId = organizationExternalId;
    }

    public PatientSelfRegistrationLink makePatientRegistrationLink(Organization org, String link) {
      return new PatientSelfRegistrationLink(org, link);
    }

    public String getLink() {
      return patientRegistrationLink;
    }

    public String getOrganizationExternalId() {
      return organizationExternalId;
    }
  }
}
