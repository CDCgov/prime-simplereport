package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.util.HashSet;
import java.util.Iterator;
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

  @ManyToOne(optional = true, fetch = FetchType.LAZY)
  @JoinColumn(name = "default_device_specimen_type_id")
  private DeviceSpecimenType defaultDeviceSpecimen;

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
      // DeviceSpecimenType defaultDeviceSpecimen,
      List<DeviceType> configuredDevices) {
    super(org);
    this.facilityName = facilityName;
    this.cliaNumber = cliaNumber;
    this.address = facilityAddress;
    this.telephone = phone;
    this.email = email;
    this.orderingProvider = orderingProvider;
    /*
    this.defaultDeviceSpecimen = defaultDeviceSpecimen;
    if (defaultDeviceSpecimen != null) {
      this.configuredDeviceSpecimenTypes.add(defaultDeviceSpecimen);
    }
    */
    this.configuredDeviceTypes.addAll(configuredDevices);
  }

  public void setFacilityName(String facilityName) {
    this.facilityName = facilityName;
  }

  public String getFacilityName() {
    return facilityName;
  }

  public DeviceSpecimenType getDefaultDeviceSpecimen() {
    return defaultDeviceSpecimen;
  }

  public DeviceType getDefaultDeviceType() {
    return defaultDeviceSpecimen == null ? null : defaultDeviceSpecimen.getDeviceType();
  }

  public List<DeviceType> getDeviceTypes() {
    // this might be better done on the DB side, but that seems like a recipe for
    // weird behaviors
    return configuredDeviceTypes.stream().filter(e -> !e.isDeleted()).collect(Collectors.toList());
  }
  /*
    return configuredDeviceSpecimenTypes.stream()
        .filter(e -> !e.isDeleted())
        .map(DeviceSpecimenType::getDeviceType)
        .filter(e -> !e.isDeleted())
        .collect(Collectors.toList());
  }
        */

  /*
  public List<DeviceSpecimenType> getDeviceSpecimenTypes() {
    return configuredDeviceSpecimenTypes.stream()
        .filter(
            e ->
                !(e.isDeleted()
                    || e.getSpecimenType().isDeleted()
                    || e.getDeviceType().isDeleted()))
        .collect(Collectors.toList());
  }

  public void addDeviceSpecimenType(DeviceSpecimenType ds) {
    configuredDeviceSpecimenTypes.add(ds);
  }

  public void removeDeviceSpecimenType(DeviceSpecimenType existing) {
    configuredDeviceSpecimenTypes.remove(existing); // count on this being in one hibernate session
  }
  */

  public void addDefaultDeviceSpecimen(DeviceSpecimenType newDefault) {
    if (newDefault != null) {
      configuredDeviceTypes.add(newDefault.getDeviceType());
    }

    defaultDeviceSpecimen = newDefault;
  }

  public void addDeviceType(DeviceType device) {
    configuredDeviceTypes.add(device);
  }

  public void removeDeviceType(DeviceType existingDevice) {
    Iterator<DeviceType> i = configuredDeviceTypes.iterator();
    UUID removedId = existingDevice.getInternalId();
    /*
    if (defaultDeviceSpecimen != null
        && defaultDeviceSpecimen.getDeviceType().getInternalId().equals(removedId)) {
      defaultDeviceSpecimen = null;
    }
    */
    while (i != null && i.hasNext()) {
      DeviceType d = i.next();
      if (d.getInternalId().equals(removedId)) {
        i.remove();
        break;
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
}
