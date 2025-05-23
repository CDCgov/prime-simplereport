package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotEmpty;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.Setter;

@Entity
public class Facility extends OrganizationScopedEternalEntity implements LocatedEntity {

  @Column(nullable = false, unique = false) // unique within an organization only
  @Getter
  @Setter
  private String facilityName;

  // these are common to all the children of the immediate base class, but ...
  @Embedded @Getter @Setter private StreetAddress address;
  @Column @Getter @Setter private String telephone;

  @Column @Getter @Setter private String email;

  @Column @Getter @Setter private String cliaNumber;

  @ManyToOne
  @JoinColumn(name = "default_ordering_provider_id")
  private Provider defaultOrderingProvider;

  @ManyToOne(optional = true, fetch = FetchType.EAGER)
  @JoinColumn(name = "default_device_type_id")
  @Getter
  private DeviceType defaultDeviceType;

  @ManyToOne(optional = true, fetch = FetchType.EAGER)
  @JoinColumn(name = "default_specimen_type_id")
  @Getter
  private SpecimenType defaultSpecimenType;

  @OneToMany
  @JoinTable(
      name = "facility_providers",
      joinColumns = @JoinColumn(name = "facility_id"),
      inverseJoinColumns = @JoinColumn(name = "provider_id"))
  @NotEmpty(message = "Minimum 1 ordering provider is required")
  private Set<Provider> orderingProviders = new HashSet<>();

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "facility_device_type",
      joinColumns = @JoinColumn(name = "facility_id"),
      inverseJoinColumns = @JoinColumn(name = "device_type_id"))
  private Set<DeviceType> configuredDeviceTypes = new HashSet<>();

  protected Facility() {
    /* for hibernate */ }

  public Facility(FacilityBuilder facilityBuilder) {
    super(facilityBuilder.org);
    this.facilityName = facilityBuilder.facilityName;
    this.cliaNumber = facilityBuilder.cliaNumber;
    this.address = facilityBuilder.facilityAddress;
    this.telephone = facilityBuilder.phone;
    this.email = facilityBuilder.email;
    this.defaultOrderingProvider = facilityBuilder.orderingProvider;
    this.orderingProviders.add(facilityBuilder.orderingProvider);
    this.configuredDeviceTypes.addAll(facilityBuilder.configuredDevices);
    this.setDefaultDeviceTypeSpecimenType(
        facilityBuilder.defaultDeviceType, facilityBuilder.defaultSpecimenType);
  }

  public Provider getOrderingProvider() {
    if (defaultOrderingProvider != null) {
      return defaultOrderingProvider;
    }
    return orderingProviders.iterator().next();
  }

  public void setDefaultDeviceTypeSpecimenType(DeviceType deviceType, SpecimenType specimenType) {
    if (deviceType != null) {
      configuredDeviceTypes.add(deviceType);
    }

    this.defaultDeviceType = deviceType;
    this.defaultSpecimenType = specimenType;
  }

  public void removeDefaultDeviceTypeSpecimenType() {
    this.setDefaultDeviceTypeSpecimenType(null, null);
  }

  public void addDeviceType(DeviceType device) {
    configuredDeviceTypes.add(device);
  }

  public List<DeviceType> getDeviceTypes() {
    return configuredDeviceTypes.stream()
        .filter(e -> !e.getIsDeleted())
        .collect(Collectors.toList());
  }

  public void removeDeviceType(DeviceType deletedDevice) {
    this.configuredDeviceTypes.remove(deletedDevice);

    // If the corresponding device to a facility's default device swab type is removed,
    // set default to null
    if (this.getDefaultDeviceType() != null
        && this.getDefaultDeviceType().getInternalId().equals(deletedDevice.getInternalId())) {
      this.removeDefaultDeviceTypeSpecimenType();
    }
  }
}
