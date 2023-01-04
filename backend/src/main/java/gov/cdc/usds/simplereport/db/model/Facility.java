package gov.cdc.usds.simplereport.db.model;

import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToAddress;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToIdentifier;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.emailToContactPoint;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.phoneNumberToContactPoint;

import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointUse;

@Entity
public class Facility extends OrganizationScopedEternalEntity implements LocatedEntity {

  @Column(nullable = false, unique = false) // unique within an organization only
  private String facilityName;

  // these are common to all the children of the immediate base class, but ...
  @Embedded private StreetAddress address;
  @Column private String telephone;

  @Column private String email;

  @Column private String cliaNumber;

  @ManyToOne(optional = false)
  @JoinColumn(name = "ordering_provider_id", nullable = false)
  private Provider orderingProvider;

  @ManyToOne(optional = true, fetch = FetchType.EAGER)
  @JoinColumn(name = "default_device_specimen_type_id")
  private DeviceSpecimenType defaultDeviceSpecimen;

  @ManyToOne(optional = true, fetch = FetchType.EAGER)
  @JoinColumn(name = "default_device_type_id")
  private DeviceType defaultDeviceType;

  @ManyToOne(optional = true, fetch = FetchType.EAGER)
  @JoinColumn(name = "default_specimen_type_id")
  private SpecimenType defaultSpecimenType;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "facility_device_type",
      joinColumns = @JoinColumn(name = "facility_id"),
      inverseJoinColumns = @JoinColumn(name = "device_type_id"))
  private Set<DeviceType> configuredDeviceTypes = new HashSet<>();

  protected Facility() {
    /* for hibernate */ }

  public Facility(
      Organization org,
      String facilityName,
      String cliaNumber,
      StreetAddress facilityAddress,
      String phone,
      String email,
      Provider orderingProvider,
      DeviceSpecimenType defaultDeviceSpecimen,
      List<DeviceType> configuredDevices) {
    this(
        org,
        facilityName,
        cliaNumber,
        facilityAddress,
        phone,
        email,
        orderingProvider,
        configuredDevices);
    this.addDefaultDeviceSpecimen(defaultDeviceSpecimen);
  }

  public Facility(
      Organization org,
      String facilityName,
      String cliaNumber,
      StreetAddress facilityAddress,
      String phone,
      String email,
      Provider orderingProvider,
      List<DeviceType> configuredDevices) {
    super(org);
    this.facilityName = facilityName;
    this.cliaNumber = cliaNumber;
    this.address = facilityAddress;
    this.telephone = phone;
    this.email = email;
    this.orderingProvider = orderingProvider;
    this.configuredDeviceTypes.addAll(configuredDevices);
  }

  public void setFacilityName(String facilityName) {
    this.facilityName = facilityName;
  }

  public String getFacilityName() {
    return facilityName;
  }

  public DeviceType getDefaultDeviceType() {
    return this.defaultDeviceSpecimen == null ? null : this.defaultDeviceSpecimen.getDeviceType();
  }

  public SpecimenType getDefaultSpecimenType() {
    return defaultSpecimenType;
  }

  public void addDeviceType(DeviceType device) {
    configuredDeviceTypes.add(device);
  }

  public List<DeviceType> getDeviceTypes() {
    return configuredDeviceTypes.stream().filter(e -> !e.isDeleted()).collect(Collectors.toList());
  }

  public DeviceSpecimenType getDefaultDeviceSpecimen() {
    return defaultDeviceSpecimen;
  }

  public void addDefaultDeviceSpecimen(DeviceSpecimenType newDefault) {
    if (newDefault != null) {
      configuredDeviceTypes.add(newDefault.getDeviceType());
      this.defaultDeviceType = newDefault.getDeviceType();
      this.defaultSpecimenType = newDefault.getSpecimenType();
    }

    defaultDeviceSpecimen = newDefault;
  }

  public void removeDefaultDeviceSpecimen() {
    defaultDeviceSpecimen = null;
  }

  public void removeDeviceType(DeviceType deletedDevice) {
    this.configuredDeviceTypes.remove(deletedDevice);

    // If the corresponding device to a facility's default device swab type is removed,
    // set default to null
    if (this.getDefaultDeviceSpecimen() != null) {
      UUID defaultDeviceTypeId = this.defaultDeviceSpecimen.getDeviceType().getInternalId();
      if (defaultDeviceTypeId.equals(deletedDevice.getInternalId())) {
        this.addDefaultDeviceSpecimen(null);
      }
    }
  }

  public String getCliaNumber() {
    return this.cliaNumber;
  }

  public void setCliaNumber(String cliaNumber) {
    this.cliaNumber = cliaNumber;
  }

  public Provider getOrderingProvider() {
    return orderingProvider;
  }

  public void setOrderingProvider(Provider orderingProvider) {
    this.orderingProvider = orderingProvider;
  }

  public StreetAddress getAddress() {
    return address;
  }

  public void setAddress(StreetAddress address) {
    this.address = address;
  }

  public String getTelephone() {
    return telephone;
  }

  public void setTelephone(String telephone) {
    this.telephone = telephone;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public org.hl7.fhir.r4.model.Organization toFhir() {
    var org = new org.hl7.fhir.r4.model.Organization();
    org.addIdentifier(convertToIdentifier(getInternalId()));
    org.setName(facilityName);
    org.addTelecom(phoneNumberToContactPoint(ContactPointUse.WORK, telephone));
    org.addTelecom(emailToContactPoint(email));
    org.addAddress(convertToAddress(address));
    return org;
  }
}
